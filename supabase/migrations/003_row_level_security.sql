-- World Cup 2026 Predictor - Row Level Security Policies
-- Ensures data access is properly controlled

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Anyone can read all profiles (for leaderboard)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ========================================
-- TEAMS POLICIES
-- ========================================

-- Anyone can read all teams
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

-- Only admins can modify teams
CREATE POLICY "Only admins can insert teams"
    ON teams FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Only admins can update teams"
    ON teams FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- ========================================
-- MATCHES POLICIES
-- ========================================

-- Anyone can read all matches
CREATE POLICY "Matches are viewable by everyone"
    ON matches FOR SELECT
    USING (true);

-- Only admins can insert matches
CREATE POLICY "Only admins can insert matches"
    ON matches FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Only admins can update matches (to enter scores)
CREATE POLICY "Only admins can update matches"
    ON matches FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- ========================================
-- PREDICTIONS POLICIES
-- ========================================

-- Users can see their own predictions anytime
CREATE POLICY "Users can view own predictions"
    ON predictions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can see other predictions only after match has started (kickoff time)
CREATE POLICY "Users can view others predictions after kickoff"
    ON predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = predictions.match_id
            AND matches.match_date <= NOW()
        )
    );

-- Users can insert predictions for scheduled matches before kickoff
CREATE POLICY "Users can create predictions before kickoff"
    ON predictions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW()
        )
    );

-- Users can update their own predictions before kickoff
CREATE POLICY "Users can update own predictions before kickoff"
    ON predictions FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW()
        )
    );

-- Users can delete their own predictions before kickoff
CREATE POLICY "Users can delete own predictions before kickoff"
    ON predictions FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND matches.status = 'scheduled'
            AND matches.match_date > NOW()
        )
    );
