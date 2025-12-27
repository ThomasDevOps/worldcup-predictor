-- World Cup 2026 Predictor - Bonus Questions
-- Tournament-wide predictions like "Top Scorer" and "Most Assists"

-- Create bonus_questions table
CREATE TABLE bonus_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    answer_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'player', 'team', 'number'
    points_value INTEGER NOT NULL DEFAULT 10,
    correct_answer TEXT, -- NULL until graded by admin
    deadline TIMESTAMPTZ NOT NULL, -- When answers lock
    is_graded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bonus_answers table (user responses)
CREATE TABLE bonus_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES bonus_questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    points_earned INTEGER, -- NULL until graded
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_question UNIQUE (user_id, question_id)
);

-- Create indexes
CREATE INDEX idx_bonus_questions_deadline ON bonus_questions(deadline);
CREATE INDEX idx_bonus_questions_graded ON bonus_questions(is_graded);
CREATE INDEX idx_bonus_answers_user ON bonus_answers(user_id);
CREATE INDEX idx_bonus_answers_question ON bonus_answers(question_id);

-- Apply updated_at trigger
CREATE TRIGGER update_bonus_questions_updated_at
    BEFORE UPDATE ON bonus_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonus_answers_updated_at
    BEFORE UPDATE ON bonus_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE bonus_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bonus_questions
-- Everyone can read questions
CREATE POLICY "Anyone can view bonus questions"
    ON bonus_questions FOR SELECT
    USING (true);

-- Only admins can insert/update/delete questions
CREATE POLICY "Admins can insert bonus questions"
    ON bonus_questions FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

CREATE POLICY "Admins can update bonus questions"
    ON bonus_questions FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

CREATE POLICY "Admins can delete bonus questions"
    ON bonus_questions FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- RLS Policies for bonus_answers
-- Users can read their own answers anytime
CREATE POLICY "Users can view own bonus answers"
    ON bonus_answers FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view others' answers only after deadline has passed
CREATE POLICY "Users can view others answers after deadline"
    ON bonus_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bonus_questions
            WHERE bonus_questions.id = bonus_answers.question_id
            AND bonus_questions.deadline <= NOW()
        )
    );

-- Users can insert their own answers before deadline
CREATE POLICY "Users can insert own bonus answers before deadline"
    ON bonus_answers FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM bonus_questions
            WHERE bonus_questions.id = question_id
            AND bonus_questions.deadline > NOW()
        )
    );

-- Users can update their own answers before deadline
CREATE POLICY "Users can update own bonus answers before deadline"
    ON bonus_answers FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM bonus_questions
            WHERE bonus_questions.id = question_id
            AND bonus_questions.deadline > NOW()
        )
    );

-- Admins can update any answers (for grading)
CREATE POLICY "Admins can update bonus answers for grading"
    ON bonus_answers FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- Function to grade bonus answers and update points
CREATE OR REPLACE FUNCTION grade_bonus_question(
    p_question_id UUID,
    p_correct_answer TEXT
)
RETURNS void AS $$
DECLARE
    ans RECORD;
    q_points INTEGER;
BEGIN
    -- Get the points value for this question
    SELECT points_value INTO q_points FROM bonus_questions WHERE id = p_question_id;

    -- Update the question with correct answer and mark as graded
    UPDATE bonus_questions
    SET correct_answer = p_correct_answer, is_graded = true
    WHERE id = p_question_id;

    -- Grade all answers for this question
    FOR ans IN SELECT * FROM bonus_answers WHERE question_id = p_question_id LOOP
        IF LOWER(TRIM(ans.answer)) = LOWER(TRIM(p_correct_answer)) THEN
            UPDATE bonus_answers SET points_earned = q_points WHERE id = ans.id;
        ELSE
            UPDATE bonus_answers SET points_earned = 0 WHERE id = ans.id;
        END IF;
    END LOOP;

    -- Recalculate total points for all affected users
    UPDATE profiles
    SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM predictions
        WHERE predictions.user_id = profiles.id
    ) + (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM bonus_answers
        WHERE bonus_answers.user_id = profiles.id
    )
    WHERE id IN (
        SELECT DISTINCT user_id FROM bonus_answers WHERE question_id = p_question_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the calculate_prediction_points function to include bonus_answers
-- This ensures total_points always includes both predictions AND bonus answers
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
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

        -- Recalculate total points for all affected users (including bonus answers)
        UPDATE profiles
        SET total_points = (
            SELECT COALESCE(SUM(points_earned), 0)
            FROM predictions
            WHERE predictions.user_id = profiles.id
        ) + (
            SELECT COALESCE(SUM(points_earned), 0)
            FROM bonus_answers
            WHERE bonus_answers.user_id = profiles.id
        )
        WHERE id IN (
            SELECT DISTINCT user_id FROM predictions WHERE match_id = NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Seed some initial bonus questions
INSERT INTO bonus_questions (question_text, answer_type, points_value, deadline) VALUES
('Who will be the top scorer of the tournament?', 'player', 15, '2026-06-11 00:00:00+00'),
('Who will have the most assists?', 'player', 15, '2026-06-11 00:00:00+00'),
('Which team will win the World Cup?', 'team', 20, '2026-06-11 00:00:00+00'),
('Who will win the Golden Ball (best player)?', 'player', 10, '2026-06-11 00:00:00+00');
