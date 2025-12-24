-- FIFA World Cup 2026 - Complete Seed Data
-- 48 Teams across 12 Groups (A-L)
-- 104 Matches (72 Group Stage + 32 Knockout)
-- Source: FIFA Official Schedule

-- ========================================
-- ALL 48 TEAMS
-- ========================================

-- Group A
INSERT INTO teams (name, country_code, group_name) VALUES
('Mexico', 'MX', 'Group A'),
('South Korea', 'KR', 'Group A'),
('South Africa', 'ZA', 'Group A'),
('TBD (UEFA Path D)', 'XX', 'Group A');

-- Group B
INSERT INTO teams (name, country_code, group_name) VALUES
('Canada', 'CA', 'Group B'),
('Switzerland', 'CH', 'Group B'),
('Qatar', 'QA', 'Group B'),
('TBD (UEFA Path A)', 'XX', 'Group B');

-- Group C
INSERT INTO teams (name, country_code, group_name) VALUES
('Brazil', 'BR', 'Group C'),
('Morocco', 'MA', 'Group C'),
('Scotland', 'GB', 'Group C'),
('Haiti', 'HT', 'Group C');

-- Group D
INSERT INTO teams (name, country_code, group_name) VALUES
('United States', 'US', 'Group D'),
('Australia', 'AU', 'Group D'),
('Paraguay', 'PY', 'Group D'),
('TBD (UEFA Path C)', 'XX', 'Group D');

-- Group E
INSERT INTO teams (name, country_code, group_name) VALUES
('Germany', 'DE', 'Group E'),
('Ecuador', 'EC', 'Group E'),
('Ivory Coast', 'CI', 'Group E'),
('Curacao', 'CW', 'Group E');

-- Group F
INSERT INTO teams (name, country_code, group_name) VALUES
('Netherlands', 'NL', 'Group F'),
('Japan', 'JP', 'Group F'),
('Tunisia', 'TN', 'Group F'),
('TBD (UEFA Path B)', 'XX', 'Group F');

-- Group G
INSERT INTO teams (name, country_code, group_name) VALUES
('Belgium', 'BE', 'Group G'),
('Iran', 'IR', 'Group G'),
('Egypt', 'EG', 'Group G'),
('New Zealand', 'NZ', 'Group G');

-- Group H
INSERT INTO teams (name, country_code, group_name) VALUES
('Spain', 'ES', 'Group H'),
('Uruguay', 'UY', 'Group H'),
('Saudi Arabia', 'SA', 'Group H'),
('Cape Verde', 'CV', 'Group H');

-- Group I
INSERT INTO teams (name, country_code, group_name) VALUES
('France', 'FR', 'Group I'),
('Senegal', 'SN', 'Group I'),
('Norway', 'NO', 'Group I'),
('TBD (IC Path 2)', 'XX', 'Group I');

-- Group J
INSERT INTO teams (name, country_code, group_name) VALUES
('Argentina', 'AR', 'Group J'),
('Austria', 'AT', 'Group J'),
('Algeria', 'DZ', 'Group J'),
('Jordan', 'JO', 'Group J');

-- Group K
INSERT INTO teams (name, country_code, group_name) VALUES
('Portugal', 'PT', 'Group K'),
('Colombia', 'CO', 'Group K'),
('Uzbekistan', 'UZ', 'Group K'),
('TBD (IC Path 1)', 'XX', 'Group K');

-- Group L
INSERT INTO teams (name, country_code, group_name) VALUES
('England', 'GB', 'Group L'),
('Croatia', 'HR', 'Group L'),
('Panama', 'PA', 'Group L'),
('Ghana', 'GH', 'Group L');

-- ========================================
-- ALL 104 MATCHES
-- ========================================

DO $$
DECLARE
    -- Group A teams
    mexico_id UUID;
    south_korea_id UUID;
    south_africa_id UUID;
    uefa_path_d_id UUID;
    -- Group B teams
    canada_id UUID;
    switzerland_id UUID;
    qatar_id UUID;
    uefa_path_a_id UUID;
    -- Group C teams
    brazil_id UUID;
    morocco_id UUID;
    scotland_id UUID;
    haiti_id UUID;
    -- Group D teams
    usa_id UUID;
    australia_id UUID;
    paraguay_id UUID;
    uefa_path_c_id UUID;
    -- Group E teams
    germany_id UUID;
    ecuador_id UUID;
    ivory_coast_id UUID;
    curacao_id UUID;
    -- Group F teams
    netherlands_id UUID;
    japan_id UUID;
    tunisia_id UUID;
    uefa_path_b_id UUID;
    -- Group G teams
    belgium_id UUID;
    iran_id UUID;
    egypt_id UUID;
    new_zealand_id UUID;
    -- Group H teams
    spain_id UUID;
    uruguay_id UUID;
    saudi_arabia_id UUID;
    cape_verde_id UUID;
    -- Group I teams
    france_id UUID;
    senegal_id UUID;
    norway_id UUID;
    ic_path_2_id UUID;
    -- Group J teams
    argentina_id UUID;
    austria_id UUID;
    algeria_id UUID;
    jordan_id UUID;
    -- Group K teams
    portugal_id UUID;
    colombia_id UUID;
    uzbekistan_id UUID;
    ic_path_1_id UUID;
    -- Group L teams
    england_id UUID;
    croatia_id UUID;
    panama_id UUID;
    ghana_id UUID;

BEGIN
    -- Get all team IDs
    SELECT id INTO mexico_id FROM teams WHERE name = 'Mexico';
    SELECT id INTO south_korea_id FROM teams WHERE name = 'South Korea';
    SELECT id INTO south_africa_id FROM teams WHERE name = 'South Africa';
    SELECT id INTO uefa_path_d_id FROM teams WHERE name = 'TBD (UEFA Path D)';

    SELECT id INTO canada_id FROM teams WHERE name = 'Canada';
    SELECT id INTO switzerland_id FROM teams WHERE name = 'Switzerland';
    SELECT id INTO qatar_id FROM teams WHERE name = 'Qatar';
    SELECT id INTO uefa_path_a_id FROM teams WHERE name = 'TBD (UEFA Path A)';

    SELECT id INTO brazil_id FROM teams WHERE name = 'Brazil';
    SELECT id INTO morocco_id FROM teams WHERE name = 'Morocco';
    SELECT id INTO scotland_id FROM teams WHERE name = 'Scotland';
    SELECT id INTO haiti_id FROM teams WHERE name = 'Haiti';

    SELECT id INTO usa_id FROM teams WHERE name = 'United States';
    SELECT id INTO australia_id FROM teams WHERE name = 'Australia';
    SELECT id INTO paraguay_id FROM teams WHERE name = 'Paraguay';
    SELECT id INTO uefa_path_c_id FROM teams WHERE name = 'TBD (UEFA Path C)';

    SELECT id INTO germany_id FROM teams WHERE name = 'Germany';
    SELECT id INTO ecuador_id FROM teams WHERE name = 'Ecuador';
    SELECT id INTO ivory_coast_id FROM teams WHERE name = 'Ivory Coast';
    SELECT id INTO curacao_id FROM teams WHERE name = 'Curacao';

    SELECT id INTO netherlands_id FROM teams WHERE name = 'Netherlands';
    SELECT id INTO japan_id FROM teams WHERE name = 'Japan';
    SELECT id INTO tunisia_id FROM teams WHERE name = 'Tunisia';
    SELECT id INTO uefa_path_b_id FROM teams WHERE name = 'TBD (UEFA Path B)';

    SELECT id INTO belgium_id FROM teams WHERE name = 'Belgium';
    SELECT id INTO iran_id FROM teams WHERE name = 'Iran';
    SELECT id INTO egypt_id FROM teams WHERE name = 'Egypt';
    SELECT id INTO new_zealand_id FROM teams WHERE name = 'New Zealand';

    SELECT id INTO spain_id FROM teams WHERE name = 'Spain';
    SELECT id INTO uruguay_id FROM teams WHERE name = 'Uruguay';
    SELECT id INTO saudi_arabia_id FROM teams WHERE name = 'Saudi Arabia';
    SELECT id INTO cape_verde_id FROM teams WHERE name = 'Cape Verde';

    SELECT id INTO france_id FROM teams WHERE name = 'France';
    SELECT id INTO senegal_id FROM teams WHERE name = 'Senegal';
    SELECT id INTO norway_id FROM teams WHERE name = 'Norway';
    SELECT id INTO ic_path_2_id FROM teams WHERE name = 'TBD (IC Path 2)';

    SELECT id INTO argentina_id FROM teams WHERE name = 'Argentina';
    SELECT id INTO austria_id FROM teams WHERE name = 'Austria';
    SELECT id INTO algeria_id FROM teams WHERE name = 'Algeria';
    SELECT id INTO jordan_id FROM teams WHERE name = 'Jordan';

    SELECT id INTO portugal_id FROM teams WHERE name = 'Portugal';
    SELECT id INTO colombia_id FROM teams WHERE name = 'Colombia';
    SELECT id INTO uzbekistan_id FROM teams WHERE name = 'Uzbekistan';
    SELECT id INTO ic_path_1_id FROM teams WHERE name = 'TBD (IC Path 1)';

    SELECT id INTO england_id FROM teams WHERE name = 'England';
    SELECT id INTO croatia_id FROM teams WHERE name = 'Croatia';
    SELECT id INTO panama_id FROM teams WHERE name = 'Panama';
    SELECT id INTO ghana_id FROM teams WHERE name = 'Ghana';

    -- ========================================
    -- GROUP STAGE - MATCHDAY 1 (June 11-14)
    -- ========================================

    -- June 11, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (mexico_id, south_africa_id, '2026-06-11 19:00:00+00', 'Group A', 'Estadio Azteca, Mexico City'),
    (south_korea_id, uefa_path_d_id, '2026-06-12 02:00:00+00', 'Group A', 'Estadio Akron, Guadalajara');

    -- June 12, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (canada_id, uefa_path_a_id, '2026-06-12 19:00:00+00', 'Group B', 'BMO Field, Toronto'),
    (brazil_id, morocco_id, '2026-06-12 22:00:00+00', 'Group C', 'MetLife Stadium, New York'),
    (usa_id, paraguay_id, '2026-06-13 01:00:00+00', 'Group D', 'SoFi Stadium, Los Angeles');

    -- June 13, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (qatar_id, switzerland_id, '2026-06-13 19:00:00+00', 'Group B', 'Levi''s Stadium, San Francisco'),
    (haiti_id, scotland_id, '2026-06-14 01:00:00+00', 'Group C', 'Gillette Stadium, Boston'),
    (australia_id, uefa_path_c_id, '2026-06-14 04:00:00+00', 'Group D', 'BC Place, Vancouver');

    -- June 14, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (germany_id, curacao_id, '2026-06-14 19:00:00+00', 'Group E', 'Mercedes-Benz Stadium, Atlanta'),
    (netherlands_id, tunisia_id, '2026-06-14 22:00:00+00', 'Group F', 'Lincoln Financial Field, Philadelphia'),
    (belgium_id, new_zealand_id, '2026-06-15 01:00:00+00', 'Group G', 'Arrowhead Stadium, Kansas City');

    -- June 15, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (ivory_coast_id, ecuador_id, '2026-06-15 19:00:00+00', 'Group E', 'BBVA Stadium, Monterrey'),
    (japan_id, uefa_path_b_id, '2026-06-15 22:00:00+00', 'Group F', 'AT&T Stadium, Dallas'),
    (iran_id, egypt_id, '2026-06-16 01:00:00+00', 'Group G', 'Hard Rock Stadium, Miami');

    -- June 16, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (spain_id, cape_verde_id, '2026-06-16 19:00:00+00', 'Group H', 'NRG Stadium, Houston'),
    (france_id, ic_path_2_id, '2026-06-16 22:00:00+00', 'Group I', 'MetLife Stadium, New York'),
    (argentina_id, jordan_id, '2026-06-17 01:00:00+00', 'Group J', 'Hard Rock Stadium, Miami');

    -- June 17, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (uruguay_id, saudi_arabia_id, '2026-06-17 19:00:00+00', 'Group H', 'Estadio Azteca, Mexico City'),
    (senegal_id, norway_id, '2026-06-17 22:00:00+00', 'Group I', 'Mercedes-Benz Stadium, Atlanta'),
    (austria_id, algeria_id, '2026-06-18 01:00:00+00', 'Group J', 'Lincoln Financial Field, Philadelphia');

    -- June 18, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (portugal_id, ic_path_1_id, '2026-06-18 19:00:00+00', 'Group K', 'Gillette Stadium, Boston'),
    (england_id, ghana_id, '2026-06-18 22:00:00+00', 'Group L', 'AT&T Stadium, Dallas'),
    (colombia_id, uzbekistan_id, '2026-06-19 01:00:00+00', 'Group K', 'SoFi Stadium, Los Angeles');

    -- June 19, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (croatia_id, panama_id, '2026-06-19 22:00:00+00', 'Group L', 'Arrowhead Stadium, Kansas City');

    -- ========================================
    -- GROUP STAGE - MATCHDAY 2 (June 19-23)
    -- ========================================

    -- June 19-20, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (south_africa_id, south_korea_id, '2026-06-20 01:00:00+00', 'Group A', 'BBVA Stadium, Monterrey'),
    (mexico_id, uefa_path_d_id, '2026-06-20 19:00:00+00', 'Group A', 'Estadio Akron, Guadalajara');

    -- June 20-21, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (uefa_path_a_id, qatar_id, '2026-06-20 22:00:00+00', 'Group B', 'BMO Field, Toronto'),
    (morocco_id, haiti_id, '2026-06-21 01:00:00+00', 'Group C', 'Gillette Stadium, Boston'),
    (canada_id, switzerland_id, '2026-06-21 19:00:00+00', 'Group B', 'BC Place, Vancouver');

    -- June 21-22, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (brazil_id, scotland_id, '2026-06-21 22:00:00+00', 'Group C', 'Levi''s Stadium, San Francisco'),
    (paraguay_id, australia_id, '2026-06-22 01:00:00+00', 'Group D', 'NRG Stadium, Houston'),
    (usa_id, uefa_path_c_id, '2026-06-22 19:00:00+00', 'Group D', 'SoFi Stadium, Los Angeles');

    -- June 22-23, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (curacao_id, ivory_coast_id, '2026-06-22 22:00:00+00', 'Group E', 'BBVA Stadium, Monterrey'),
    (tunisia_id, japan_id, '2026-06-23 01:00:00+00', 'Group F', 'Lincoln Financial Field, Philadelphia'),
    (germany_id, ecuador_id, '2026-06-23 19:00:00+00', 'Group E', 'Mercedes-Benz Stadium, Atlanta');

    -- June 23-24, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (netherlands_id, uefa_path_b_id, '2026-06-23 22:00:00+00', 'Group F', 'AT&T Stadium, Dallas'),
    (new_zealand_id, iran_id, '2026-06-24 01:00:00+00', 'Group G', 'Arrowhead Stadium, Kansas City'),
    (belgium_id, egypt_id, '2026-06-24 19:00:00+00', 'Group G', 'Hard Rock Stadium, Miami');

    -- June 24-25, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (cape_verde_id, uruguay_id, '2026-06-24 22:00:00+00', 'Group H', 'Estadio Azteca, Mexico City'),
    (ic_path_2_id, senegal_id, '2026-06-25 01:00:00+00', 'Group I', 'Mercedes-Benz Stadium, Atlanta'),
    (spain_id, saudi_arabia_id, '2026-06-25 19:00:00+00', 'Group H', 'NRG Stadium, Houston');

    -- June 25-26, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (france_id, norway_id, '2026-06-25 22:00:00+00', 'Group I', 'MetLife Stadium, New York'),
    (jordan_id, austria_id, '2026-06-26 01:00:00+00', 'Group J', 'Lincoln Financial Field, Philadelphia'),
    (argentina_id, algeria_id, '2026-06-26 19:00:00+00', 'Group J', 'Hard Rock Stadium, Miami');

    -- June 26-27, 2026
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (ic_path_1_id, colombia_id, '2026-06-26 22:00:00+00', 'Group K', 'SoFi Stadium, Los Angeles'),
    (ghana_id, croatia_id, '2026-06-27 01:00:00+00', 'Group L', 'AT&T Stadium, Dallas'),
    (portugal_id, uzbekistan_id, '2026-06-27 19:00:00+00', 'Group K', 'Gillette Stadium, Boston'),
    (england_id, panama_id, '2026-06-27 22:00:00+00', 'Group L', 'Arrowhead Stadium, Kansas City');

    -- ========================================
    -- GROUP STAGE - MATCHDAY 3 (June 27-July 1)
    -- ========================================

    -- June 27-28, 2026 (Group A & B final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (south_korea_id, mexico_id, '2026-06-28 00:00:00+00', 'Group A', 'Estadio Azteca, Mexico City'),
    (uefa_path_d_id, south_africa_id, '2026-06-28 00:00:00+00', 'Group A', 'Estadio Akron, Guadalajara'),
    (switzerland_id, qatar_id, '2026-06-28 20:00:00+00', 'Group B', 'Levi''s Stadium, San Francisco'),
    (uefa_path_a_id, canada_id, '2026-06-28 20:00:00+00', 'Group B', 'BC Place, Vancouver');

    -- June 28-29, 2026 (Group C & D final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (scotland_id, brazil_id, '2026-06-29 00:00:00+00', 'Group C', 'MetLife Stadium, New York'),
    (haiti_id, morocco_id, '2026-06-29 00:00:00+00', 'Group C', 'Gillette Stadium, Boston'),
    (australia_id, usa_id, '2026-06-29 20:00:00+00', 'Group D', 'SoFi Stadium, Los Angeles'),
    (uefa_path_c_id, paraguay_id, '2026-06-29 20:00:00+00', 'Group D', 'NRG Stadium, Houston');

    -- June 29-30, 2026 (Group E & F final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (ecuador_id, germany_id, '2026-06-30 00:00:00+00', 'Group E', 'Mercedes-Benz Stadium, Atlanta'),
    (ivory_coast_id, curacao_id, '2026-06-30 00:00:00+00', 'Group E', 'BBVA Stadium, Monterrey'),
    (japan_id, netherlands_id, '2026-06-30 20:00:00+00', 'Group F', 'AT&T Stadium, Dallas'),
    (uefa_path_b_id, tunisia_id, '2026-06-30 20:00:00+00', 'Group F', 'Lincoln Financial Field, Philadelphia');

    -- June 30 - July 1, 2026 (Group G & H final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (iran_id, belgium_id, '2026-07-01 00:00:00+00', 'Group G', 'Hard Rock Stadium, Miami'),
    (egypt_id, new_zealand_id, '2026-07-01 00:00:00+00', 'Group G', 'Arrowhead Stadium, Kansas City'),
    (uruguay_id, spain_id, '2026-07-01 20:00:00+00', 'Group H', 'NRG Stadium, Houston'),
    (saudi_arabia_id, cape_verde_id, '2026-07-01 20:00:00+00', 'Group H', 'Estadio Azteca, Mexico City');

    -- July 1-2, 2026 (Group I & J final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (senegal_id, france_id, '2026-07-02 00:00:00+00', 'Group I', 'MetLife Stadium, New York'),
    (norway_id, ic_path_2_id, '2026-07-02 00:00:00+00', 'Group I', 'Mercedes-Benz Stadium, Atlanta'),
    (austria_id, argentina_id, '2026-07-02 20:00:00+00', 'Group J', 'Hard Rock Stadium, Miami'),
    (algeria_id, jordan_id, '2026-07-02 20:00:00+00', 'Group J', 'Lincoln Financial Field, Philadelphia');

    -- July 2-3, 2026 (Group K & L final matchday)
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (colombia_id, portugal_id, '2026-07-03 00:00:00+00', 'Group K', 'Gillette Stadium, Boston'),
    (uzbekistan_id, ic_path_1_id, '2026-07-03 00:00:00+00', 'Group K', 'SoFi Stadium, Los Angeles'),
    (croatia_id, england_id, '2026-07-03 20:00:00+00', 'Group L', 'AT&T Stadium, Dallas'),
    (panama_id, ghana_id, '2026-07-03 20:00:00+00', 'Group L', 'Arrowhead Stadium, Kansas City');

    -- ========================================
    -- ROUND OF 32 (July 4-7, 2026)
    -- Using placeholder teams - will be determined by group results
    -- ========================================

    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    -- July 4
    (mexico_id, haiti_id, '2026-07-04 18:00:00+00', 'Round of 32', 'MetLife Stadium, New York'),
    (brazil_id, south_korea_id, '2026-07-04 22:00:00+00', 'Round of 32', 'AT&T Stadium, Dallas'),
    -- July 5
    (usa_id, qatar_id, '2026-07-05 18:00:00+00', 'Round of 32', 'SoFi Stadium, Los Angeles'),
    (canada_id, paraguay_id, '2026-07-05 22:00:00+00', 'Round of 32', 'BC Place, Vancouver'),
    -- July 6
    (germany_id, tunisia_id, '2026-07-06 18:00:00+00', 'Round of 32', 'Mercedes-Benz Stadium, Atlanta'),
    (netherlands_id, ivory_coast_id, '2026-07-06 22:00:00+00', 'Round of 32', 'Lincoln Financial Field, Philadelphia'),
    -- July 7
    (belgium_id, saudi_arabia_id, '2026-07-07 18:00:00+00', 'Round of 32', 'Arrowhead Stadium, Kansas City'),
    (spain_id, iran_id, '2026-07-07 22:00:00+00', 'Round of 32', 'NRG Stadium, Houston'),
    -- July 8
    (france_id, algeria_id, '2026-07-08 18:00:00+00', 'Round of 32', 'MetLife Stadium, New York'),
    (argentina_id, norway_id, '2026-07-08 22:00:00+00', 'Round of 32', 'Hard Rock Stadium, Miami'),
    -- July 9
    (portugal_id, panama_id, '2026-07-09 18:00:00+00', 'Round of 32', 'Gillette Stadium, Boston'),
    (england_id, colombia_id, '2026-07-09 22:00:00+00', 'Round of 32', 'AT&T Stadium, Dallas');

    -- Additional Round of 32 matches
    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (morocco_id, south_africa_id, '2026-07-04 14:00:00+00', 'Round of 32', 'Estadio Azteca, Mexico City'),
    (switzerland_id, australia_id, '2026-07-05 14:00:00+00', 'Round of 32', 'BMO Field, Toronto'),
    (japan_id, curacao_id, '2026-07-06 14:00:00+00', 'Round of 32', 'Levi''s Stadium, San Francisco'),
    (uruguay_id, egypt_id, '2026-07-07 14:00:00+00', 'Round of 32', 'Estadio Akron, Guadalajara');

    -- ========================================
    -- ROUND OF 16 (July 10-13, 2026)
    -- ========================================

    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    -- July 10
    (brazil_id, netherlands_id, '2026-07-10 18:00:00+00', 'Round of 16', 'MetLife Stadium, New York'),
    (germany_id, spain_id, '2026-07-10 22:00:00+00', 'Round of 16', 'AT&T Stadium, Dallas'),
    -- July 11
    (france_id, england_id, '2026-07-11 18:00:00+00', 'Round of 16', 'SoFi Stadium, Los Angeles'),
    (argentina_id, portugal_id, '2026-07-11 22:00:00+00', 'Round of 16', 'Hard Rock Stadium, Miami'),
    -- July 12
    (mexico_id, usa_id, '2026-07-12 18:00:00+00', 'Round of 16', 'Mercedes-Benz Stadium, Atlanta'),
    (belgium_id, morocco_id, '2026-07-12 22:00:00+00', 'Round of 16', 'Lincoln Financial Field, Philadelphia'),
    -- July 13
    (canada_id, switzerland_id, '2026-07-13 18:00:00+00', 'Round of 16', 'Gillette Stadium, Boston'),
    (uruguay_id, japan_id, '2026-07-13 22:00:00+00', 'Round of 16', 'Arrowhead Stadium, Kansas City');

    -- ========================================
    -- QUARTER-FINALS (July 15-16, 2026)
    -- ========================================

    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (brazil_id, germany_id, '2026-07-15 18:00:00+00', 'Quarter-finals', 'Gillette Stadium, Boston'),
    (france_id, argentina_id, '2026-07-15 22:00:00+00', 'Quarter-finals', 'SoFi Stadium, Los Angeles'),
    (mexico_id, belgium_id, '2026-07-16 18:00:00+00', 'Quarter-finals', 'Hard Rock Stadium, Miami'),
    (canada_id, uruguay_id, '2026-07-16 22:00:00+00', 'Quarter-finals', 'Arrowhead Stadium, Kansas City');

    -- ========================================
    -- SEMI-FINALS (July 18-19, 2026)
    -- ========================================

    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (brazil_id, france_id, '2026-07-18 22:00:00+00', 'Semi-finals', 'AT&T Stadium, Dallas'),
    (mexico_id, canada_id, '2026-07-19 22:00:00+00', 'Semi-finals', 'MetLife Stadium, New York');

    -- ========================================
    -- THIRD PLACE & FINAL (July 22-23, 2026)
    -- ========================================

    INSERT INTO matches (home_team_id, away_team_id, match_date, stage, venue) VALUES
    (france_id, canada_id, '2026-07-22 21:00:00+00', 'Third Place', 'Hard Rock Stadium, Miami'),
    (brazil_id, mexico_id, '2026-07-23 19:00:00+00', 'Final', 'MetLife Stadium, New York');

END $$;

-- ========================================
-- ADMIN USER SETUP
-- After signing up, run this to make yourself admin:
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
-- ========================================
