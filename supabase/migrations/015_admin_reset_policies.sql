-- Migration: Add function for admins to reset match results
-- Uses SECURITY DEFINER to bypass RLS

-- Create a function that admins can call to reset a match to scheduled
CREATE OR REPLACE FUNCTION reset_match_to_scheduled(p_match_id UUID)
RETURNS void AS $$
DECLARE
    is_user_admin BOOLEAN;
BEGIN
    -- Check if the current user is an admin
    SELECT is_admin INTO is_user_admin FROM profiles WHERE id = auth.uid();

    IF NOT is_user_admin THEN
        RAISE EXCEPTION 'Only admins can reset matches';
    END IF;

    -- Clear points from all predictions for this match
    UPDATE predictions
    SET points_earned = NULL
    WHERE match_id = p_match_id;

    -- Recalculate total points for all affected users
    UPDATE profiles
    SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM predictions
        WHERE predictions.user_id = profiles.id
    )
    WHERE id IN (
        SELECT DISTINCT user_id FROM predictions WHERE match_id = p_match_id
    );

    -- Reset the match status and scores
    UPDATE matches
    SET home_score = NULL,
        away_score = NULL,
        status = 'scheduled'
    WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION reset_match_to_scheduled(UUID) IS 'Resets a match to scheduled status, clears scores, and recalculates affected user points. Admin only.';
