-- Fix: Allow viewing predictions when match is finished (not just after kickoff time)
-- This handles the case where admin marks a match finished before actual kickoff date

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view others predictions after kickoff" ON predictions;

-- Create updated policy that checks BOTH kickoff time OR finished status
CREATE POLICY "Users can view others predictions after kickoff or finished"
    ON predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND (matches.match_date <= NOW() OR matches.status = 'finished')
        )
    );
