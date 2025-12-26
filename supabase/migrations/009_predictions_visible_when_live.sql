-- Allow viewing predictions when match is LIVE (not just after kickoff or finished)
-- This ensures everyone can see each other's predictions as soon as match goes live

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view others predictions after kickoff or finished" ON predictions;

-- Create updated policy that includes live status
CREATE POLICY "Users can view others predictions when match started"
    ON predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND (
                matches.match_date <= NOW()
                OR matches.status = 'live'
                OR matches.status = 'finished'
            )
        )
    );

COMMENT ON POLICY "Users can view others predictions when match started" ON predictions IS
    'Predictions are visible to everyone once match is live, finished, or past kickoff time';
