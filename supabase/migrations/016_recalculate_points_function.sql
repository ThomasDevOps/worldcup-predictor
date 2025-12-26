-- Migration: Add recalculate_all_points function for disaster recovery
-- This function can be used to recalculate all prediction points after a restore

CREATE OR REPLACE FUNCTION recalculate_all_points()
RETURNS TABLE(
  matches_processed INTEGER,
  predictions_updated INTEGER,
  profiles_updated INTEGER
) AS $$
DECLARE
  match_record RECORD;
  v_matches_processed INTEGER := 0;
  v_predictions_updated INTEGER := 0;
  v_profiles_updated INTEGER := 0;
BEGIN
  -- Step 1: Reset all prediction points to NULL
  UPDATE predictions SET points_earned = NULL;
  GET DIAGNOSTICS v_predictions_updated = ROW_COUNT;

  -- Step 2: Reset all profile total_points to 0
  UPDATE profiles SET total_points = 0;
  GET DIAGNOSTICS v_profiles_updated = ROW_COUNT;

  -- Step 3: Recalculate points for each finished match
  -- by triggering the scoring calculation
  FOR match_record IN
    SELECT id, home_score, away_score
    FROM matches
    WHERE status = 'finished'
      AND home_score IS NOT NULL
      AND away_score IS NOT NULL
  LOOP
    -- Calculate points for all predictions on this match
    UPDATE predictions p
    SET points_earned = (
      CASE
        -- Exact score: 10 points
        WHEN p.predicted_home_score = match_record.home_score
         AND p.predicted_away_score = match_record.away_score
        THEN 10
        -- Correct winner/draw: 5 points (+ 4 bonus for draw)
        WHEN (
          -- Both predicted and actual are draws
          (p.predicted_home_score = p.predicted_away_score AND match_record.home_score = match_record.away_score)
          OR
          -- Both predicted and actual are home wins
          (p.predicted_home_score > p.predicted_away_score AND match_record.home_score > match_record.away_score)
          OR
          -- Both predicted and actual are away wins
          (p.predicted_home_score < p.predicted_away_score AND match_record.home_score < match_record.away_score)
        )
        THEN
          CASE
            -- Draw bonus: +4 points
            WHEN p.predicted_home_score = p.predicted_away_score
             AND match_record.home_score = match_record.away_score
            THEN 9  -- 5 + 4 draw bonus
            ELSE 5
          END
        ELSE 0
      END
    )
    WHERE p.match_id = match_record.id;

    v_matches_processed := v_matches_processed + 1;
  END LOOP;

  -- Step 4: Recalculate total_points for all profiles
  UPDATE profiles p
  SET total_points = COALESCE((
    SELECT SUM(points_earned)
    FROM predictions
    WHERE user_id = p.id
  ), 0);

  RETURN QUERY SELECT v_matches_processed, v_predictions_updated, v_profiles_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION recalculate_all_points() IS
  'Recalculates all prediction points from scratch. Use for disaster recovery after restoring data.';

-- Grant execute to authenticated users (admins should call this)
GRANT EXECUTE ON FUNCTION recalculate_all_points() TO authenticated;
