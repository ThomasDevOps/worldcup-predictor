-- Lock predictions 15 minutes before kickoff instead of at kickoff
-- This gives users a clear deadline and prevents last-second changes

-- Drop existing policies that use kickoff time
DROP POLICY IF EXISTS "Users can create predictions before kickoff" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions before kickoff" ON predictions;
DROP POLICY IF EXISTS "Users can delete own predictions before kickoff" ON predictions;
DROP POLICY IF EXISTS "Users can view others predictions when match started" ON predictions;

-- Recreate policies with 15-minute buffer before kickoff
-- Users can only INSERT predictions if match is scheduled AND more than 15 minutes until kickoff
CREATE POLICY "Users can create predictions before lockout"
    ON predictions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW() + INTERVAL '15 minutes'
        )
    );

-- Users can only UPDATE their own predictions if match is scheduled AND more than 15 minutes until kickoff
CREATE POLICY "Users can update own predictions before lockout"
    ON predictions FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW() + INTERVAL '15 minutes'
        )
    );

-- Users can only DELETE their own predictions if match is scheduled AND more than 15 minutes until kickoff
CREATE POLICY "Users can delete own predictions before lockout"
    ON predictions FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW() + INTERVAL '15 minutes'
        )
    );

-- Predictions become visible to everyone 15 minutes before kickoff (when locked)
-- This reveals predictions when users can no longer change them
CREATE POLICY "Users can view others predictions when locked"
    ON predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND (
                -- Match is within 15 minutes of kickoff or has started
                matches.match_date <= NOW() + INTERVAL '15 minutes'
                OR matches.status = 'live'
                OR matches.status = 'finished'
            )
        )
    );

COMMENT ON POLICY "Users can create predictions before lockout" ON predictions IS
    'Predictions can only be created up to 15 minutes before kickoff';
COMMENT ON POLICY "Users can update own predictions before lockout" ON predictions IS
    'Predictions can only be updated up to 15 minutes before kickoff';
COMMENT ON POLICY "Users can delete own predictions before lockout" ON predictions IS
    'Predictions can only be deleted up to 15 minutes before kickoff';
COMMENT ON POLICY "Users can view others predictions when locked" ON predictions IS
    'All predictions become visible 15 minutes before kickoff when they are locked';
