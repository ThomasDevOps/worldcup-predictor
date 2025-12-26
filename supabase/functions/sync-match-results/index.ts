// Supabase Edge Function: Sync Match Results from football-data.org
// Fetches World Cup match results and updates the database

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const FOOTBALL_DATA_API_URL = "https://api.football-data.org/v4";
const WORLD_CUP_CODE = "WC";

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string; // Three-letter acronym
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
  };
  score: {
    winner: string | null;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

interface RequestBody {
  testMode?: boolean; // If true, fetch PL matches and show API response (no DB update)
  competition?: string; // Override competition code (default: WC)
  dryRun?: boolean; // If true, show what would be updated without updating
  daysBack?: number; // How many days back to fetch (default: 7)
  syncKnockoutTeams?: boolean; // If true, sync knockout stage team assignments
  syncGroupTeams?: boolean; // If true, sync group stage TBD team assignments (playoff qualifiers)
}

// Map football-data.org status to our database status
function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
  switch (apiStatus) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    default:
      return "scheduled";
  }
}

// Map API stage names to our database stage names
function mapStageName(apiStage: string): string {
  const stageMap: Record<string, string> = {
    "LAST_32": "Round of 32",
    "LAST_16": "Round of 16",
    "QUARTER_FINALS": "Quarter-finals",
    "SEMI_FINALS": "Semi-finals",
    "THIRD_PLACE": "Third Place",
    "FINAL": "Final",
  };
  return stageMap[apiStage] || apiStage;
}

// Handle knockout teams sync - updates TBD teams with actual qualified teams
async function handleKnockoutTeamsSync(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  competition: string,
  dryRun: boolean
): Promise<Response> {
  console.log("Starting knockout teams sync...");

  const results = {
    mode: dryRun ? "DRY_RUN" : "PRODUCTION",
    type: "KNOCKOUT_TEAMS_SYNC",
    updated: 0,
    skipped: 0,
    errors: [] as string[],
    matches: [] as object[],
  };

  // Fetch knockout stage matches from API
  const knockoutStages = "LAST_32,LAST_16,QUARTER_FINALS,SEMI_FINALS,THIRD_PLACE,FINAL";
  const apiUrl = `${FOOTBALL_DATA_API_URL}/competitions/${competition}/matches?stage=${knockoutStages}`;

  console.log(`Fetching knockout matches from: ${apiUrl}`);

  const apiResponse = await fetch(apiUrl, {
    headers: { "X-Auth-Token": apiKey },
  });

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    throw new Error(`Football-data.org API error: ${apiResponse.status} - ${errorText}`);
  }

  const data: FootballDataResponse = await apiResponse.json();
  console.log(`Found ${data.matches.length} knockout matches from API`);

  // Process each knockout match
  for (const apiMatch of data.matches) {
    try {
      // Skip if teams are not yet determined (null in API)
      if (!apiMatch.homeTeam?.id || !apiMatch.awayTeam?.id) {
        results.skipped++;
        continue;
      }

      const apiStage = (apiMatch as unknown as { stage: string }).stage;
      const dbStage = mapStageName(apiStage);
      const matchDate = apiMatch.utcDate.split("T")[0];

      // Find teams in our database by name
      const { data: homeTeam } = await supabase
        .from("teams")
        .select("id, name")
        .or(`name.ilike.%${apiMatch.homeTeam.name}%,name.ilike.%${apiMatch.homeTeam.shortName}%`)
        .not("name", "ilike", "%TBD%")
        .single();

      const { data: awayTeam } = await supabase
        .from("teams")
        .select("id, name")
        .or(`name.ilike.%${apiMatch.awayTeam.name}%,name.ilike.%${apiMatch.awayTeam.shortName}%`)
        .not("name", "ilike", "%TBD%")
        .single();

      if (!homeTeam || !awayTeam) {
        results.skipped++;
        results.errors.push(
          `Could not find teams: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name}`
        );
        continue;
      }

      // Find the knockout match in our database by stage and date
      const { data: dbMatches, error: matchError } = await supabase
        .from("matches")
        .select("id, home_team_id, away_team_id, stage")
        .eq("stage", dbStage)
        .gte("match_date", `${matchDate}T00:00:00`)
        .lt("match_date", `${matchDate}T23:59:59`);

      if (matchError || !dbMatches || dbMatches.length === 0) {
        results.skipped++;
        results.errors.push(`No ${dbStage} match found on ${matchDate}`);
        continue;
      }

      // Find the specific match - check if it has TBD teams
      const dbMatch = dbMatches.find(m => {
        // Match should have TBD teams (we want to update those)
        return m.home_team_id !== homeTeam.id || m.away_team_id !== awayTeam.id;
      });

      if (!dbMatch) {
        // Teams already match, skip
        results.skipped++;
        continue;
      }

      // Check if current teams are TBD
      const { data: currentHomeTeam } = await supabase
        .from("teams")
        .select("name")
        .eq("id", dbMatch.home_team_id)
        .single();

      const { data: currentAwayTeam } = await supabase
        .from("teams")
        .select("name")
        .eq("id", dbMatch.away_team_id)
        .single();

      const isTBDMatch =
        currentHomeTeam?.name?.includes("TBD") || currentAwayTeam?.name?.includes("TBD");

      if (!isTBDMatch) {
        // Not a TBD match, already has real teams
        results.skipped++;
        continue;
      }

      if (dryRun) {
        results.updated++;
        results.matches.push({
          id: dbMatch.id,
          stage: dbStage,
          date: matchDate,
          currentTeams: `${currentHomeTeam?.name} vs ${currentAwayTeam?.name}`,
          newTeams: `${homeTeam.name} vs ${awayTeam.name}`,
          action: "WOULD_UPDATE",
        });
        console.log(
          `[DRY RUN] Would update ${dbStage}: ${currentHomeTeam?.name} vs ${currentAwayTeam?.name} → ${homeTeam.name} vs ${awayTeam.name}`
        );
        continue;
      }

      // Update the match with real teams
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
        })
        .eq("id", dbMatch.id);

      if (updateError) {
        results.errors.push(`Failed to update match ${dbMatch.id}: ${updateError.message}`);
        continue;
      }

      results.updated++;
      results.matches.push({
        id: dbMatch.id,
        stage: dbStage,
        date: matchDate,
        teams: `${homeTeam.name} vs ${awayTeam.name}`,
        action: "UPDATED",
      });

      console.log(`Updated ${dbStage}: ${homeTeam.name} vs ${awayTeam.name}`);
    } catch (error) {
      results.errors.push(`Error processing knockout match: ${error}`);
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  try {
    // Parse request body
    let body: RequestBody = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is fine
    }

    const {
      testMode = false,
      competition = WORLD_CUP_CODE,
      dryRun = false,
      syncKnockoutTeams = false,
      // daysBack reserved for future use (e.g., fetching historical results)
    } = body;

    // Get API key from environment
    const footballDataApiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");
    if (!footballDataApiKey) {
      throw new Error("FOOTBALL_DATA_API_KEY environment variable not set");
    }

    // Create Supabase client with service role for database updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle knockout teams sync mode
    if (syncKnockoutTeams) {
      return await handleKnockoutTeamsSync(supabase, footballDataApiKey, competition, dryRun);
    }

    // Fetch matches from football-data.org
    // Only fetch live matches (IN_PLAY, PAUSED) and recently finished matches (FINISHED)
    // This minimizes API usage - we don't need scheduled matches or old finished matches
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Use PL (Premier League) for test mode to get real match data
    const competitionCode = testMode ? "PL" : competition;

    // Fetch live matches + finished matches from today (grace period for delayed API updates)
    const apiUrl = `${FOOTBALL_DATA_API_URL}/competitions/${competitionCode}/matches?status=IN_PLAY,PAUSED,FINISHED&dateFrom=${today}&dateTo=${tomorrow}`;

    console.log(`Fetching matches from: ${apiUrl}`);
    console.log(
      `Mode: ${testMode ? "TEST" : "PRODUCTION"}, Competition: ${competitionCode}, DryRun: ${dryRun}`
    );

    const apiResponse = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": footballDataApiKey,
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(
        `Football-data.org API error: ${apiResponse.status} - ${errorText}`
      );
    }

    const data: FootballDataResponse = await apiResponse.json();
    console.log(`Found ${data.matches.length} matches from API`);

    // In test mode, just return the API response without updating DB
    if (testMode) {
      const formattedMatches = data.matches.map((m) => ({
        date: m.utcDate,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        status: m.status,
        score:
          m.score.fullTime.home !== null
            ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
            : "N/A",
        mappedStatus: mapStatus(m.status),
      }));

      return new Response(
        JSON.stringify(
          {
            mode: "TEST",
            competition: competitionCode,
            message:
              "Test mode - showing API response without updating database",
            matchCount: data.matches.length,
            matches: formattedMatches,
          },
          null,
          2
        ),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const results = {
      mode: dryRun ? "DRY_RUN" : "PRODUCTION",
      competition: competitionCode,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      matches: [] as object[],
    };

    // Process each match
    for (const apiMatch of data.matches) {
      try {
        // Find matching match in our database by team names and date
        // We match on the date (ignoring time) and team names
        const matchDate = apiMatch.utcDate.split("T")[0];

        // Get teams from our database
        const { data: homeTeam } = await supabase
          .from("teams")
          .select("id, name")
          .or(
            `name.ilike.%${apiMatch.homeTeam.name}%,name.ilike.%${apiMatch.homeTeam.shortName}%`
          )
          .single();

        const { data: awayTeam } = await supabase
          .from("teams")
          .select("id, name")
          .or(
            `name.ilike.%${apiMatch.awayTeam.name}%,name.ilike.%${apiMatch.awayTeam.shortName}%`
          )
          .single();

        if (!homeTeam || !awayTeam) {
          results.skipped++;
          results.errors.push(
            `Could not find teams: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name}`
          );
          continue;
        }

        // Find the match in our database
        const { data: dbMatch, error: matchError } = await supabase
          .from("matches")
          .select("id, home_score, away_score, status")
          .eq("home_team_id", homeTeam.id)
          .eq("away_team_id", awayTeam.id)
          .gte("match_date", `${matchDate}T00:00:00`)
          .lt("match_date", `${matchDate}T23:59:59`)
          .single();

        if (matchError || !dbMatch) {
          results.skipped++;
          results.errors.push(
            `Match not found in DB: ${homeTeam.name} vs ${awayTeam.name} on ${matchDate}`
          );
          continue;
        }

        // Skip matches already finished in our database - they never need updates
        if (dbMatch.status === "finished") {
          results.skipped++;
          continue;
        }

        // Only update if the match has scores and status has changed
        const newStatus = mapStatus(apiMatch.status);
        const homeScore = apiMatch.score.fullTime.home;
        const awayScore = apiMatch.score.fullTime.away;

        // Check if update is needed
        const needsUpdate =
          dbMatch.status !== newStatus ||
          (homeScore !== null && dbMatch.home_score !== homeScore) ||
          (awayScore !== null && dbMatch.away_score !== awayScore);

        if (!needsUpdate) {
          results.skipped++;
          continue;
        }

        // Prepare update data
        const updateData: {
          status: string;
          home_score?: number;
          away_score?: number;
        } = {
          status: newStatus,
        };

        if (homeScore !== null) updateData.home_score = homeScore;
        if (awayScore !== null) updateData.away_score = awayScore;

        // In dry run mode, don't actually update
        if (dryRun) {
          results.updated++;
          results.matches.push({
            id: dbMatch.id,
            teams: `${homeTeam.name} vs ${awayTeam.name}`,
            currentScore: `${dbMatch.home_score ?? "?"} - ${dbMatch.away_score ?? "?"}`,
            newScore: `${homeScore} - ${awayScore}`,
            currentStatus: dbMatch.status,
            newStatus: newStatus,
            action: "WOULD_UPDATE",
          });
          console.log(
            `[DRY RUN] Would update: ${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} (${newStatus})`
          );
          continue;
        }

        // Actually update the match
        const { error: updateError } = await supabase
          .from("matches")
          .update(updateData)
          .eq("id", dbMatch.id);

        if (updateError) {
          results.errors.push(
            `Failed to update match ${dbMatch.id}: ${updateError.message}`
          );
          continue;
        }

        results.updated++;
        results.matches.push({
          id: dbMatch.id,
          teams: `${homeTeam.name} vs ${awayTeam.name}`,
          score: `${homeScore} - ${awayScore}`,
          status: newStatus,
          action: "UPDATED",
        });

        console.log(
          `Updated match: ${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} (${newStatus})`
        );
      } catch (matchError) {
        results.errors.push(`Error processing match: ${matchError}`);
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Run `supabase functions serve --env-file supabase/.env.local`
  3. Make HTTP requests:

  # Production mode (World Cup) - sync live/finished match scores:
  curl -X POST 'http://127.0.0.1:54321/functions/v1/sync-match-results' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    -H 'Content-Type: application/json'

  # Knockout teams sync - update TBD teams with actual qualified teams (run daily):
  curl -X POST 'http://127.0.0.1:54321/functions/v1/sync-match-results' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    -H 'Content-Type: application/json' \
    -d '{"syncKnockoutTeams": true}'

  # Knockout teams sync - dry run (shows what would be updated):
  curl -X POST 'http://127.0.0.1:54321/functions/v1/sync-match-results' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    -H 'Content-Type: application/json' \
    -d '{"syncKnockoutTeams": true, "dryRun": true}'

  # Test mode (Premier League - shows API data without DB updates):
  curl -X POST 'http://127.0.0.1:54321/functions/v1/sync-match-results' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    -H 'Content-Type: application/json' \
    -d '{"testMode": true}'

  # Dry run mode (shows what would be updated):
  curl -X POST 'http://127.0.0.1:54321/functions/v1/sync-match-results' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    -H 'Content-Type: application/json' \
    -d '{"dryRun": true}'

*/
