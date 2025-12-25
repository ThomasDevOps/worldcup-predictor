-- Fix: Scoring trigger needs SECURITY DEFINER to bypass RLS
-- The trigger must update predictions and profiles for ALL users,
-- but RLS policies only allow users to update their own records.
-- SECURITY DEFINER makes the function run with owner privileges.

CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    pred RECORD;
    actual_home INTEGER;
    actual_away INTEGER;
    base_points INTEGER;
    draw_bonus INTEGER;
    total_points INTEGER;
BEGIN
    -- Only run when match status changes to 'finished'
    IF NEW.status = 'finished' AND (OLD.status != 'finished' OR OLD.home_score != NEW.home_score OR OLD.away_score != NEW.away_score) THEN
        actual_home := NEW.home_score;
        actual_away := NEW.away_score;

        -- Calculate points for all predictions on this match
        FOR pred IN SELECT * FROM predictions WHERE match_id = NEW.id LOOP
            -- Calculate base points
            IF pred.predicted_home_score = actual_home AND pred.predicted_away_score = actual_away THEN
                -- Exact score
                base_points := 10;
            ELSIF SIGN(pred.predicted_home_score - pred.predicted_away_score) = SIGN(actual_home - actual_away) THEN
                -- Correct outcome (winner or draw)
                base_points := 5;
            ELSE
                -- Wrong prediction
                base_points := 0;
            END IF;

            -- Calculate draw bonus
            IF actual_home = actual_away AND pred.predicted_home_score = pred.predicted_away_score THEN
                -- Both actual and predicted are draws
                draw_bonus := 4;
            ELSE
                draw_bonus := 0;
            END IF;

            total_points := base_points + draw_bonus;

            -- Update the prediction with points earned
            UPDATE predictions
            SET points_earned = total_points
            WHERE id = pred.id;
        END LOOP;

        -- Recalculate total points for all affected users
        UPDATE profiles
        SET total_points = (
            SELECT COALESCE(SUM(points_earned), 0)
            FROM predictions
            WHERE predictions.user_id = profiles.id
        )
        WHERE id IN (
            SELECT DISTINCT user_id FROM predictions WHERE match_id = NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
