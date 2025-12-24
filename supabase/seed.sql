-- World Cup 2026 Predictor - Seed Data
-- Sample teams and matches for testing

-- Note: Run this after the migrations have been applied
-- The actual World Cup 2026 fixtures will be announced closer to the tournament

-- ========================================
-- SAMPLE TEAMS (for development)
-- ========================================

-- Group A
INSERT INTO teams (name, country_code, group_name) VALUES
('Morocco', 'MA', 'Group A'),
('Canada', 'CA', 'Group A'),
('United States', 'US', 'Group A'),
('TBD A4', 'XX', 'Group A');

-- Group B
INSERT INTO teams (name, country_code, group_name) VALUES
('Spain', 'ES', 'Group B'),
('Brazil', 'BR', 'Group B'),
('Portugal', 'PT', 'Group B'),
('TBD B4', 'XX', 'Group B');

-- Group C
INSERT INTO teams (name, country_code, group_name) VALUES
('Germany', 'DE', 'Group C'),
('France', 'FR', 'Group C'),
('Argentina', 'AR', 'Group C'),
('TBD C4', 'XX', 'Group C');

-- Group D
INSERT INTO teams (name, country_code, group_name) VALUES
('England', 'GB', 'Group D'),
('Netherlands', 'NL', 'Group D'),
('Belgium', 'BE', 'Group D'),
('TBD D4', 'XX', 'Group D');

-- ========================================
-- SAMPLE MATCHES (for development)
-- ========================================

-- Get team IDs
DO $$
DECLARE
    morocco_id UUID;
    canada_id UUID;
    usa_id UUID;
    spain_id UUID;
    brazil_id UUID;
    germany_id UUID;
    france_id UUID;
    england_id UUID;
    netherlands_id UUID;
    belgium_id UUID;
BEGIN
    SELECT id INTO morocco_id FROM teams WHERE name = 'Morocco';
    SELECT id INTO canada_id FROM teams WHERE name = 'Canada';
    SELECT id INTO usa_id FROM teams WHERE name = 'United States';
    SELECT id INTO spain_id FROM teams WHERE name = 'Spain';
    SELECT id INTO brazil_id FROM teams WHERE name = 'Brazil';
    SELECT id INTO germany_id FROM teams WHERE name = 'Germany';
    SELECT id INTO france_id FROM teams WHERE name = 'France';
    SELECT id INTO england_id FROM teams WHERE name = 'England';
    SELECT id INTO netherlands_id FROM teams WHERE name = 'Netherlands';
    SELECT id INTO belgium_id FROM teams WHERE name = 'Belgium';

    -- Group A matches
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (usa_id, morocco_id, '2026-06-11 18:00:00+00', 'Group A', 'SoFi Stadium, Los Angeles'),
    (canada_id, usa_id, '2026-06-15 21:00:00+00', 'Group A', 'AT&T Stadium, Dallas');

    -- Group B matches
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (spain_id, brazil_id, '2026-06-12 15:00:00+00', 'Group B', 'MetLife Stadium, New York');

    -- Group C matches
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (germany_id, france_id, '2026-06-13 18:00:00+00', 'Group C', 'Mercedes-Benz Stadium, Atlanta'),
    (france_id, germany_id, '2026-06-18 18:00:00+00', 'Group C', 'Hard Rock Stadium, Miami');

    -- Group D matches
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (england_id, netherlands_id, '2026-06-14 21:00:00+00', 'Group D', 'Levi''s Stadium, San Francisco'),
    (belgium_id, england_id, '2026-06-19 15:00:00+00', 'Group D', 'Lincoln Financial Field, Philadelphia');

    -- Knockout sample
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (brazil_id, germany_id, '2026-07-04 18:00:00+00', 'Round of 16', 'MetLife Stadium, New York'),
    (france_id, england_id, '2026-07-08 21:00:00+00', 'Quarter-finals', 'AT&T Stadium, Dallas'),
    (spain_id, netherlands_id, '2026-07-15 18:00:00+00', 'Semi-finals', 'Mercedes-Benz Stadium, Atlanta');

END $$;

-- ========================================
-- Note: To create an admin user, update the profile after signup:
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
-- ========================================
