-- Migration: Add daily knockout teams sync
-- This cron job checks once per day if any knockout stage teams have been determined
-- and updates our TBD placeholder teams with the actual qualified teams

-- Create a function to sync knockout teams
CREATE OR REPLACE FUNCTION sync_knockout_teams()
RETURNS void AS $$
DECLARE
    log_id UUID;
    base_url TEXT;
    edge_function_url TEXT;
    service_role_key TEXT;
BEGIN
    INSERT INTO match_sync_logs (status) VALUES ('running') RETURNING id INTO log_id;

    base_url := get_app_config('edge_function_base_url');
    service_role_key := get_app_config('service_role_key');

    edge_function_url := base_url || '/functions/v1/sync-match-results';

    -- Call the Edge Function with syncKnockoutTeams flag
    PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := '{"syncKnockoutTeams": true}'::jsonb
    );

    UPDATE match_sync_logs SET status = 'completed', completed_at = NOW() WHERE id = log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to toggle knockout teams sync schedule
CREATE OR REPLACE FUNCTION toggle_knockout_sync(enabled BOOLEAN, run_hour INTEGER DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
    existing_job RECORD;
    cron_expression TEXT;
BEGIN
    -- Check if job exists
    SELECT * INTO existing_job FROM cron.job WHERE jobname = 'sync-knockout-teams';

    IF enabled THEN
        -- Create cron expression for daily at specified hour (UTC)
        cron_expression := '0 ' || run_hour || ' * * *';

        IF existing_job IS NOT NULL THEN
            -- Update existing job
            PERFORM cron.alter_job(
                job_id := existing_job.jobid,
                schedule := cron_expression
            );
            RETURN 'Knockout sync scheduled daily at ' || run_hour || ':00 UTC';
        ELSE
            -- Create new job
            PERFORM cron.schedule(
                'sync-knockout-teams',
                cron_expression,
                'SELECT sync_knockout_teams()'
            );
            RETURN 'Knockout sync scheduled daily at ' || run_hour || ':00 UTC';
        END IF;
    ELSE
        -- Disable/remove job
        IF existing_job IS NOT NULL THEN
            PERFORM cron.unschedule(existing_job.jobid);
            RETURN 'Knockout sync disabled';
        ELSE
            RETURN 'Knockout sync was not enabled';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION sync_knockout_teams() IS 'Syncs knockout stage team assignments from football-data.org API';
COMMENT ON FUNCTION toggle_knockout_sync(BOOLEAN, INTEGER) IS 'Enable or disable daily knockout teams sync. Usage: SELECT toggle_knockout_sync(true, 6) for daily at 6:00 UTC';

-- Enable daily knockout sync by default (runs at 6:00 UTC)
SELECT toggle_knockout_sync(true, 6);
