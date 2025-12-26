-- Migration: Fix World Cup 2026 match schedule
-- Corrects dates, matchups, and venues to match official FIFA schedule
-- Source: https://www.nbcsports.com/soccer/news/2026-world-cup-schedule-confirmed-dates-times-stadiums-full-details

-- Delete test teams that shouldn't exist
DELETE FROM teams WHERE name IN ('Birmingham City FC', 'Derby County FC');

-- Delete all group stage matches to recreate with correct data
DELETE FROM matches WHERE stage LIKE 'Group %';

-- Delete knockout matches to recreate with correct dates
DELETE FROM matches WHERE stage IN ('Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third Place', 'Final');

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
    -- Knockout TBD teams
    tbd_winner_a UUID;
    tbd_runner_a UUID;
    tbd_winner_b UUID;
    tbd_runner_b UUID;
    tbd_winner_c UUID;
    tbd_runner_c UUID;
    tbd_winner_d UUID;
    tbd_runner_d UUID;
    tbd_winner_e UUID;
    tbd_runner_e UUID;
    tbd_winner_f UUID;
    tbd_runner_f UUID;
    tbd_winner_g UUID;
    tbd_runner_g UUID;
    tbd_winner_h UUID;
    tbd_runner_h UUID;
    tbd_winner_i UUID;
    tbd_runner_i UUID;
    tbd_winner_j UUID;
    tbd_runner_j UUID;
    tbd_winner_k UUID;
    tbd_runner_k UUID;
    tbd_winner_l UUID;
    tbd_runner_l UUID;
    tbd_3rd_1 UUID;
    tbd_3rd_2 UUID;
    tbd_3rd_3 UUID;
    tbd_3rd_4 UUID;
    tbd_3rd_5 UUID;
    tbd_3rd_6 UUID;
    tbd_3rd_7 UUID;
    tbd_3rd_8 UUID;
    tbd_r32_w1 UUID;
    tbd_r32_w2 UUID;
    tbd_r32_w3 UUID;
    tbd_r32_w4 UUID;
    tbd_r32_w5 UUID;
    tbd_r32_w6 UUID;
    tbd_r32_w7 UUID;
    tbd_r32_w8 UUID;
    tbd_r32_w9 UUID;
    tbd_r32_w10 UUID;
    tbd_r32_w11 UUID;
    tbd_r32_w12 UUID;
    tbd_r32_w13 UUID;
    tbd_r32_w14 UUID;
    tbd_r32_w15 UUID;
    tbd_r32_w16 UUID;
    tbd_r16_w1 UUID;
    tbd_r16_w2 UUID;
    tbd_r16_w3 UUID;
    tbd_r16_w4 UUID;
    tbd_r16_w5 UUID;
    tbd_r16_w6 UUID;
    tbd_r16_w7 UUID;
    tbd_r16_w8 UUID;
    tbd_qf_w1 UUID;
    tbd_qf_w2 UUID;
    tbd_qf_w3 UUID;
    tbd_qf_w4 UUID;
    tbd_sf_w1 UUID;
    tbd_sf_w2 UUID;
    tbd_sf_l1 UUID;
    tbd_sf_l2 UUID;
BEGIN
    -- Get Group A team IDs
    SELECT id INTO mexico_id FROM teams WHERE name = 'Mexico';
    SELECT id INTO south_korea_id FROM teams WHERE name = 'South Korea';
    SELECT id INTO south_africa_id FROM teams WHERE name = 'South Africa';
    SELECT id INTO uefa_path_d_id FROM teams WHERE name = 'TBD (UEFA Path D)';

    -- Get Group B team IDs
    SELECT id INTO canada_id FROM teams WHERE name = 'Canada';
    SELECT id INTO switzerland_id FROM teams WHERE name = 'Switzerland';
    SELECT id INTO qatar_id FROM teams WHERE name = 'Qatar';
    SELECT id INTO uefa_path_a_id FROM teams WHERE name = 'TBD (UEFA Path A)';

    -- Get Group C team IDs
    SELECT id INTO brazil_id FROM teams WHERE name = 'Brazil';
    SELECT id INTO morocco_id FROM teams WHERE name = 'Morocco';
    SELECT id INTO scotland_id FROM teams WHERE name = 'Scotland';
    SELECT id INTO haiti_id FROM teams WHERE name = 'Haiti';

    -- Get Group D team IDs
    SELECT id INTO usa_id FROM teams WHERE name = 'United States';
    SELECT id INTO australia_id FROM teams WHERE name = 'Australia';
    SELECT id INTO paraguay_id FROM teams WHERE name = 'Paraguay';
    SELECT id INTO uefa_path_c_id FROM teams WHERE name = 'TBD (UEFA Path C)';

    -- Get Group E team IDs
    SELECT id INTO germany_id FROM teams WHERE name = 'Germany';
    SELECT id INTO ecuador_id FROM teams WHERE name = 'Ecuador';
    SELECT id INTO ivory_coast_id FROM teams WHERE name = 'Ivory Coast';
    SELECT id INTO curacao_id FROM teams WHERE name = 'Curacao';

    -- Get Group F team IDs
    SELECT id INTO netherlands_id FROM teams WHERE name = 'Netherlands';
    SELECT id INTO japan_id FROM teams WHERE name = 'Japan';
    SELECT id INTO tunisia_id FROM teams WHERE name = 'Tunisia';
    SELECT id INTO uefa_path_b_id FROM teams WHERE name = 'TBD (UEFA Path B)';

    -- Get Group G team IDs
    SELECT id INTO belgium_id FROM teams WHERE name = 'Belgium';
    SELECT id INTO iran_id FROM teams WHERE name = 'Iran';
    SELECT id INTO egypt_id FROM teams WHERE name = 'Egypt';
    SELECT id INTO new_zealand_id FROM teams WHERE name = 'New Zealand';

    -- Get Group H team IDs
    SELECT id INTO spain_id FROM teams WHERE name = 'Spain';
    SELECT id INTO uruguay_id FROM teams WHERE name = 'Uruguay';
    SELECT id INTO saudi_arabia_id FROM teams WHERE name = 'Saudi Arabia';
    SELECT id INTO cape_verde_id FROM teams WHERE name = 'Cape Verde';

    -- Get Group I team IDs
    SELECT id INTO france_id FROM teams WHERE name = 'France';
    SELECT id INTO senegal_id FROM teams WHERE name = 'Senegal';
    SELECT id INTO norway_id FROM teams WHERE name = 'Norway';
    SELECT id INTO ic_path_2_id FROM teams WHERE name = 'TBD (IC Path 2)';

    -- Get Group J team IDs
    SELECT id INTO argentina_id FROM teams WHERE name = 'Argentina';
    SELECT id INTO austria_id FROM teams WHERE name = 'Austria';
    SELECT id INTO algeria_id FROM teams WHERE name = 'Algeria';
    SELECT id INTO jordan_id FROM teams WHERE name = 'Jordan';

    -- Get Group K team IDs
    SELECT id INTO portugal_id FROM teams WHERE name = 'Portugal';
    SELECT id INTO colombia_id FROM teams WHERE name = 'Colombia';
    SELECT id INTO uzbekistan_id FROM teams WHERE name = 'Uzbekistan';
    SELECT id INTO ic_path_1_id FROM teams WHERE name = 'TBD (IC Path 1)';

    -- Get Group L team IDs
    SELECT id INTO england_id FROM teams WHERE name = 'England';
    SELECT id INTO croatia_id FROM teams WHERE name = 'Croatia';
    SELECT id INTO panama_id FROM teams WHERE name = 'Panama';
    SELECT id INTO ghana_id FROM teams WHERE name = 'Ghana';

    -- Get Knockout TBD team IDs
    SELECT id INTO tbd_winner_a FROM teams WHERE name = 'TBD (Winner Group A)';
    SELECT id INTO tbd_runner_a FROM teams WHERE name = 'TBD (Runner-up Group A)';
    SELECT id INTO tbd_winner_b FROM teams WHERE name = 'TBD (Winner Group B)';
    SELECT id INTO tbd_runner_b FROM teams WHERE name = 'TBD (Runner-up Group B)';
    SELECT id INTO tbd_winner_c FROM teams WHERE name = 'TBD (Winner Group C)';
    SELECT id INTO tbd_runner_c FROM teams WHERE name = 'TBD (Runner-up Group C)';
    SELECT id INTO tbd_winner_d FROM teams WHERE name = 'TBD (Winner Group D)';
    SELECT id INTO tbd_runner_d FROM teams WHERE name = 'TBD (Runner-up Group D)';
    SELECT id INTO tbd_winner_e FROM teams WHERE name = 'TBD (Winner Group E)';
    SELECT id INTO tbd_runner_e FROM teams WHERE name = 'TBD (Runner-up Group E)';
    SELECT id INTO tbd_winner_f FROM teams WHERE name = 'TBD (Winner Group F)';
    SELECT id INTO tbd_runner_f FROM teams WHERE name = 'TBD (Runner-up Group F)';
    SELECT id INTO tbd_winner_g FROM teams WHERE name = 'TBD (Winner Group G)';
    SELECT id INTO tbd_runner_g FROM teams WHERE name = 'TBD (Runner-up Group G)';
    SELECT id INTO tbd_winner_h FROM teams WHERE name = 'TBD (Winner Group H)';
    SELECT id INTO tbd_runner_h FROM teams WHERE name = 'TBD (Runner-up Group H)';
    SELECT id INTO tbd_winner_i FROM teams WHERE name = 'TBD (Winner Group I)';
    SELECT id INTO tbd_runner_i FROM teams WHERE name = 'TBD (Runner-up Group I)';
    SELECT id INTO tbd_winner_j FROM teams WHERE name = 'TBD (Winner Group J)';
    SELECT id INTO tbd_runner_j FROM teams WHERE name = 'TBD (Runner-up Group J)';
    SELECT id INTO tbd_winner_k FROM teams WHERE name = 'TBD (Winner Group K)';
    SELECT id INTO tbd_runner_k FROM teams WHERE name = 'TBD (Runner-up Group K)';
    SELECT id INTO tbd_winner_l FROM teams WHERE name = 'TBD (Winner Group L)';
    SELECT id INTO tbd_runner_l FROM teams WHERE name = 'TBD (Runner-up Group L)';
    SELECT id INTO tbd_3rd_1 FROM teams WHERE name = 'TBD (3rd Place 1)';
    SELECT id INTO tbd_3rd_2 FROM teams WHERE name = 'TBD (3rd Place 2)';
    SELECT id INTO tbd_3rd_3 FROM teams WHERE name = 'TBD (3rd Place 3)';
    SELECT id INTO tbd_3rd_4 FROM teams WHERE name = 'TBD (3rd Place 4)';
    SELECT id INTO tbd_3rd_5 FROM teams WHERE name = 'TBD (3rd Place 5)';
    SELECT id INTO tbd_3rd_6 FROM teams WHERE name = 'TBD (3rd Place 6)';
    SELECT id INTO tbd_3rd_7 FROM teams WHERE name = 'TBD (3rd Place 7)';
    SELECT id INTO tbd_3rd_8 FROM teams WHERE name = 'TBD (3rd Place 8)';
    SELECT id INTO tbd_r32_w1 FROM teams WHERE name = 'TBD (R32 Winner 1)';
    SELECT id INTO tbd_r32_w2 FROM teams WHERE name = 'TBD (R32 Winner 2)';
    SELECT id INTO tbd_r32_w3 FROM teams WHERE name = 'TBD (R32 Winner 3)';
    SELECT id INTO tbd_r32_w4 FROM teams WHERE name = 'TBD (R32 Winner 4)';
    SELECT id INTO tbd_r32_w5 FROM teams WHERE name = 'TBD (R32 Winner 5)';
    SELECT id INTO tbd_r32_w6 FROM teams WHERE name = 'TBD (R32 Winner 6)';
    SELECT id INTO tbd_r32_w7 FROM teams WHERE name = 'TBD (R32 Winner 7)';
    SELECT id INTO tbd_r32_w8 FROM teams WHERE name = 'TBD (R32 Winner 8)';
    SELECT id INTO tbd_r32_w9 FROM teams WHERE name = 'TBD (R32 Winner 9)';
    SELECT id INTO tbd_r32_w10 FROM teams WHERE name = 'TBD (R32 Winner 10)';
    SELECT id INTO tbd_r32_w11 FROM teams WHERE name = 'TBD (R32 Winner 11)';
    SELECT id INTO tbd_r32_w12 FROM teams WHERE name = 'TBD (R32 Winner 12)';
    SELECT id INTO tbd_r32_w13 FROM teams WHERE name = 'TBD (R32 Winner 13)';
    SELECT id INTO tbd_r32_w14 FROM teams WHERE name = 'TBD (R32 Winner 14)';
    SELECT id INTO tbd_r32_w15 FROM teams WHERE name = 'TBD (R32 Winner 15)';
    SELECT id INTO tbd_r32_w16 FROM teams WHERE name = 'TBD (R32 Winner 16)';
    SELECT id INTO tbd_r16_w1 FROM teams WHERE name = 'TBD (R16 Winner 1)';
    SELECT id INTO tbd_r16_w2 FROM teams WHERE name = 'TBD (R16 Winner 2)';
    SELECT id INTO tbd_r16_w3 FROM teams WHERE name = 'TBD (R16 Winner 3)';
    SELECT id INTO tbd_r16_w4 FROM teams WHERE name = 'TBD (R16 Winner 4)';
    SELECT id INTO tbd_r16_w5 FROM teams WHERE name = 'TBD (R16 Winner 5)';
    SELECT id INTO tbd_r16_w6 FROM teams WHERE name = 'TBD (R16 Winner 6)';
    SELECT id INTO tbd_r16_w7 FROM teams WHERE name = 'TBD (R16 Winner 7)';
    SELECT id INTO tbd_r16_w8 FROM teams WHERE name = 'TBD (R16 Winner 8)';
    SELECT id INTO tbd_qf_w1 FROM teams WHERE name = 'TBD (QF Winner 1)';
    SELECT id INTO tbd_qf_w2 FROM teams WHERE name = 'TBD (QF Winner 2)';
    SELECT id INTO tbd_qf_w3 FROM teams WHERE name = 'TBD (QF Winner 3)';
    SELECT id INTO tbd_qf_w4 FROM teams WHERE name = 'TBD (QF Winner 4)';
    SELECT id INTO tbd_sf_w1 FROM teams WHERE name = 'TBD (SF Winner 1)';
    SELECT id INTO tbd_sf_w2 FROM teams WHERE name = 'TBD (SF Winner 2)';
    SELECT id INTO tbd_sf_l1 FROM teams WHERE name = 'TBD (SF Loser 1)';
    SELECT id INTO tbd_sf_l2 FROM teams WHERE name = 'TBD (SF Loser 2)';

    -- ============================================
    -- GROUP A MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (mexico_id, south_africa_id, '2026-06-11 19:00:00+00', 'Estadio Azteca, Mexico City', 'Group A', 'scheduled'),
    (south_korea_id, uefa_path_d_id, '2026-06-12 02:00:00+00', 'Estadio Akron, Guadalajara', 'Group A', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (uefa_path_d_id, south_africa_id, '2026-06-18 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Group A', 'scheduled'),
    (mexico_id, south_korea_id, '2026-06-19 01:00:00+00', 'Estadio Akron, Guadalajara', 'Group A', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (uefa_path_d_id, mexico_id, '2026-06-25 01:00:00+00', 'Estadio Azteca, Mexico City', 'Group A', 'scheduled'),
    (south_africa_id, south_korea_id, '2026-06-25 01:00:00+00', 'Estadio BBVA, Monterrey', 'Group A', 'scheduled');

    -- ============================================
    -- GROUP B MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (canada_id, uefa_path_a_id, '2026-06-12 19:00:00+00', 'BMO Field, Toronto', 'Group B', 'scheduled'),
    (qatar_id, switzerland_id, '2026-06-13 19:00:00+00', 'Levi''s Stadium, San Francisco', 'Group B', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (switzerland_id, uefa_path_a_id, '2026-06-18 19:00:00+00', 'SoFi Stadium, Los Angeles', 'Group B', 'scheduled'),
    (canada_id, qatar_id, '2026-06-18 22:00:00+00', 'BC Place, Vancouver', 'Group B', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (switzerland_id, canada_id, '2026-06-24 19:00:00+00', 'BC Place, Vancouver', 'Group B', 'scheduled'),
    (uefa_path_a_id, qatar_id, '2026-06-24 19:00:00+00', 'Lumen Field, Seattle', 'Group B', 'scheduled');

    -- ============================================
    -- GROUP C MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (brazil_id, morocco_id, '2026-06-13 22:00:00+00', 'MetLife Stadium, New York', 'Group C', 'scheduled'),
    (haiti_id, scotland_id, '2026-06-14 01:00:00+00', 'Gillette Stadium, Boston', 'Group C', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (scotland_id, morocco_id, '2026-06-19 22:00:00+00', 'Gillette Stadium, Boston', 'Group C', 'scheduled'),
    (brazil_id, haiti_id, '2026-06-20 01:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Group C', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (scotland_id, brazil_id, '2026-06-24 22:00:00+00', 'Hard Rock Stadium, Miami', 'Group C', 'scheduled'),
    (morocco_id, haiti_id, '2026-06-24 22:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Group C', 'scheduled');

    -- ============================================
    -- GROUP D MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (usa_id, paraguay_id, '2026-06-13 01:00:00+00', 'SoFi Stadium, Los Angeles', 'Group D', 'scheduled'),
    (australia_id, uefa_path_c_id, '2026-06-13 04:00:00+00', 'BC Place, Vancouver', 'Group D', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (usa_id, australia_id, '2026-06-19 19:00:00+00', 'Lumen Field, Seattle', 'Group D', 'scheduled'),
    (uefa_path_c_id, paraguay_id, '2026-06-20 04:00:00+00', 'Levi''s Stadium, San Francisco', 'Group D', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (uefa_path_c_id, usa_id, '2026-06-26 02:00:00+00', 'SoFi Stadium, Los Angeles', 'Group D', 'scheduled'),
    (paraguay_id, australia_id, '2026-06-26 02:00:00+00', 'Levi''s Stadium, San Francisco', 'Group D', 'scheduled');

    -- ============================================
    -- GROUP E MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (germany_id, curacao_id, '2026-06-14 17:00:00+00', 'NRG Stadium, Houston', 'Group E', 'scheduled'),
    (ivory_coast_id, ecuador_id, '2026-06-14 23:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Group E', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (germany_id, ivory_coast_id, '2026-06-20 20:00:00+00', 'BMO Field, Toronto', 'Group E', 'scheduled'),
    (ecuador_id, curacao_id, '2026-06-21 00:00:00+00', 'Arrowhead Stadium, Kansas City', 'Group E', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (ecuador_id, germany_id, '2026-06-25 20:00:00+00', 'MetLife Stadium, New York', 'Group E', 'scheduled'),
    (curacao_id, ivory_coast_id, '2026-06-25 20:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Group E', 'scheduled');

    -- ============================================
    -- GROUP F MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (netherlands_id, japan_id, '2026-06-14 20:00:00+00', 'AT&T Stadium, Dallas', 'Group F', 'scheduled'),
    (uefa_path_b_id, tunisia_id, '2026-06-15 02:00:00+00', 'Estadio BBVA, Monterrey', 'Group F', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (netherlands_id, uefa_path_b_id, '2026-06-20 17:00:00+00', 'NRG Stadium, Houston', 'Group F', 'scheduled'),
    (tunisia_id, japan_id, '2026-06-21 04:00:00+00', 'Estadio BBVA, Monterrey', 'Group F', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (japan_id, uefa_path_b_id, '2026-06-25 23:00:00+00', 'AT&T Stadium, Dallas', 'Group F', 'scheduled'),
    (tunisia_id, netherlands_id, '2026-06-25 23:00:00+00', 'Arrowhead Stadium, Kansas City', 'Group F', 'scheduled');

    -- ============================================
    -- GROUP G MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (belgium_id, egypt_id, '2026-06-15 19:00:00+00', 'Lumen Field, Seattle', 'Group G', 'scheduled'),
    (iran_id, new_zealand_id, '2026-06-16 01:00:00+00', 'SoFi Stadium, Los Angeles', 'Group G', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (belgium_id, iran_id, '2026-06-21 19:00:00+00', 'SoFi Stadium, Los Angeles', 'Group G', 'scheduled'),
    (new_zealand_id, egypt_id, '2026-06-22 01:00:00+00', 'BC Place, Vancouver', 'Group G', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (egypt_id, iran_id, '2026-06-27 03:00:00+00', 'Lumen Field, Seattle', 'Group G', 'scheduled'),
    (new_zealand_id, belgium_id, '2026-06-27 03:00:00+00', 'BC Place, Vancouver', 'Group G', 'scheduled');

    -- ============================================
    -- GROUP H MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (spain_id, cape_verde_id, '2026-06-15 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Group H', 'scheduled'),
    (saudi_arabia_id, uruguay_id, '2026-06-15 22:00:00+00', 'Hard Rock Stadium, Miami', 'Group H', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (spain_id, saudi_arabia_id, '2026-06-21 16:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Group H', 'scheduled'),
    (uruguay_id, cape_verde_id, '2026-06-21 22:00:00+00', 'Hard Rock Stadium, Miami', 'Group H', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (cape_verde_id, saudi_arabia_id, '2026-06-27 00:00:00+00', 'NRG Stadium, Houston', 'Group H', 'scheduled'),
    (uruguay_id, spain_id, '2026-06-27 00:00:00+00', 'Estadio Akron, Guadalajara', 'Group H', 'scheduled');

    -- ============================================
    -- GROUP I MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (france_id, senegal_id, '2026-06-16 19:00:00+00', 'MetLife Stadium, New York', 'Group I', 'scheduled'),
    (ic_path_2_id, norway_id, '2026-06-16 22:00:00+00', 'Gillette Stadium, Boston', 'Group I', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (france_id, ic_path_2_id, '2026-06-22 21:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Group I', 'scheduled'),
    (norway_id, senegal_id, '2026-06-23 00:00:00+00', 'MetLife Stadium, New York', 'Group I', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (norway_id, france_id, '2026-06-26 19:00:00+00', 'Gillette Stadium, Boston', 'Group I', 'scheduled'),
    (senegal_id, ic_path_2_id, '2026-06-26 19:00:00+00', 'BMO Field, Toronto', 'Group I', 'scheduled');

    -- ============================================
    -- GROUP J MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (argentina_id, algeria_id, '2026-06-17 01:00:00+00', 'Arrowhead Stadium, Kansas City', 'Group J', 'scheduled'),
    (austria_id, jordan_id, '2026-06-17 04:00:00+00', 'Levi''s Stadium, San Francisco', 'Group J', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (argentina_id, austria_id, '2026-06-22 17:00:00+00', 'AT&T Stadium, Dallas', 'Group J', 'scheduled'),
    (jordan_id, algeria_id, '2026-06-23 03:00:00+00', 'Levi''s Stadium, San Francisco', 'Group J', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (algeria_id, austria_id, '2026-06-28 02:00:00+00', 'Arrowhead Stadium, Kansas City', 'Group J', 'scheduled'),
    (jordan_id, argentina_id, '2026-06-28 02:00:00+00', 'AT&T Stadium, Dallas', 'Group J', 'scheduled');

    -- ============================================
    -- GROUP K MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (portugal_id, ic_path_1_id, '2026-06-17 17:00:00+00', 'NRG Stadium, Houston', 'Group K', 'scheduled'),
    (uzbekistan_id, colombia_id, '2026-06-18 02:00:00+00', 'Estadio Azteca, Mexico City', 'Group K', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (portugal_id, uzbekistan_id, '2026-06-23 17:00:00+00', 'NRG Stadium, Houston', 'Group K', 'scheduled'),
    (colombia_id, ic_path_1_id, '2026-06-24 02:00:00+00', 'Estadio Akron, Guadalajara', 'Group K', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (colombia_id, portugal_id, '2026-06-27 23:30:00+00', 'Hard Rock Stadium, Miami', 'Group K', 'scheduled'),
    (ic_path_1_id, uzbekistan_id, '2026-06-27 23:30:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Group K', 'scheduled');

    -- ============================================
    -- GROUP L MATCHES
    -- ============================================
    -- Matchday 1
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (england_id, croatia_id, '2026-06-17 20:00:00+00', 'AT&T Stadium, Dallas', 'Group L', 'scheduled'),
    (ghana_id, panama_id, '2026-06-17 23:00:00+00', 'BMO Field, Toronto', 'Group L', 'scheduled');
    -- Matchday 2
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (england_id, ghana_id, '2026-06-23 20:00:00+00', 'Gillette Stadium, Boston', 'Group L', 'scheduled'),
    (panama_id, croatia_id, '2026-06-23 23:00:00+00', 'BMO Field, Toronto', 'Group L', 'scheduled');
    -- Matchday 3
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (panama_id, england_id, '2026-06-27 21:00:00+00', 'MetLife Stadium, New York', 'Group L', 'scheduled'),
    (croatia_id, ghana_id, '2026-06-27 21:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Group L', 'scheduled');

    -- ============================================
    -- ROUND OF 32 (June 28 - July 3)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_winner_a, tbd_3rd_2, '2026-06-28 17:00:00+00', 'Estadio Azteca, Mexico City', 'Round of 32', 'scheduled'),
    (tbd_winner_b, tbd_3rd_4, '2026-06-28 21:00:00+00', 'MetLife Stadium, New York', 'Round of 32', 'scheduled'),
    (tbd_winner_c, tbd_3rd_6, '2026-06-29 17:00:00+00', 'AT&T Stadium, Dallas', 'Round of 32', 'scheduled'),
    (tbd_winner_d, tbd_3rd_8, '2026-06-29 21:00:00+00', 'BMO Field, Toronto', 'Round of 32', 'scheduled'),
    (tbd_winner_e, tbd_runner_a, '2026-06-30 17:00:00+00', 'SoFi Stadium, Los Angeles', 'Round of 32', 'scheduled'),
    (tbd_winner_f, tbd_runner_b, '2026-06-30 21:00:00+00', 'BC Place, Vancouver', 'Round of 32', 'scheduled'),
    (tbd_winner_g, tbd_runner_c, '2026-07-01 17:00:00+00', 'Levi''s Stadium, San Francisco', 'Round of 32', 'scheduled'),
    (tbd_winner_h, tbd_runner_d, '2026-07-01 21:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Round of 32', 'scheduled'),
    (tbd_winner_i, tbd_runner_e, '2026-07-02 17:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Round of 32', 'scheduled'),
    (tbd_winner_j, tbd_runner_f, '2026-07-02 21:00:00+00', 'Estadio Akron, Guadalajara', 'Round of 32', 'scheduled'),
    (tbd_winner_k, tbd_runner_g, '2026-07-02 23:00:00+00', 'Arrowhead Stadium, Kansas City', 'Round of 32', 'scheduled'),
    (tbd_winner_l, tbd_runner_h, '2026-07-03 01:00:00+00', 'NRG Stadium, Houston', 'Round of 32', 'scheduled'),
    (tbd_3rd_1, tbd_runner_i, '2026-07-03 17:00:00+00', 'MetLife Stadium, New York', 'Round of 32', 'scheduled'),
    (tbd_3rd_3, tbd_runner_j, '2026-07-03 21:00:00+00', 'Hard Rock Stadium, Miami', 'Round of 32', 'scheduled'),
    (tbd_3rd_5, tbd_runner_k, '2026-07-03 23:00:00+00', 'Gillette Stadium, Boston', 'Round of 32', 'scheduled'),
    (tbd_3rd_7, tbd_runner_l, '2026-07-04 01:00:00+00', 'AT&T Stadium, Dallas', 'Round of 32', 'scheduled');

    -- ============================================
    -- ROUND OF 16 (July 4-7)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_r32_w1, tbd_r32_w2, '2026-07-04 19:00:00+00', 'NRG Stadium, Houston', 'Round of 16', 'scheduled'),
    (tbd_r32_w3, tbd_r32_w4, '2026-07-04 23:00:00+00', 'Lincoln Financial Field, Philadelphia', 'Round of 16', 'scheduled'),
    (tbd_r32_w5, tbd_r32_w6, '2026-07-05 19:00:00+00', 'MetLife Stadium, New York', 'Round of 16', 'scheduled'),
    (tbd_r32_w7, tbd_r32_w8, '2026-07-05 23:00:00+00', 'Estadio Azteca, Mexico City', 'Round of 16', 'scheduled'),
    (tbd_r32_w9, tbd_r32_w10, '2026-07-06 19:00:00+00', 'AT&T Stadium, Dallas', 'Round of 16', 'scheduled'),
    (tbd_r32_w11, tbd_r32_w12, '2026-07-06 23:00:00+00', 'Lumen Field, Seattle', 'Round of 16', 'scheduled'),
    (tbd_r32_w13, tbd_r32_w14, '2026-07-07 19:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Round of 16', 'scheduled'),
    (tbd_r32_w15, tbd_r32_w16, '2026-07-07 23:00:00+00', 'BC Place, Vancouver', 'Round of 16', 'scheduled');

    -- ============================================
    -- QUARTER-FINALS (July 9-11)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_r16_w1, tbd_r16_w2, '2026-07-09 21:00:00+00', 'Gillette Stadium, Boston', 'Quarter-finals', 'scheduled'),
    (tbd_r16_w3, tbd_r16_w4, '2026-07-10 21:00:00+00', 'SoFi Stadium, Los Angeles', 'Quarter-finals', 'scheduled'),
    (tbd_r16_w5, tbd_r16_w6, '2026-07-11 17:00:00+00', 'Hard Rock Stadium, Miami', 'Quarter-finals', 'scheduled'),
    (tbd_r16_w7, tbd_r16_w8, '2026-07-11 21:00:00+00', 'Arrowhead Stadium, Kansas City', 'Quarter-finals', 'scheduled');

    -- ============================================
    -- SEMI-FINALS (July 14-15)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_qf_w1, tbd_qf_w2, '2026-07-14 21:00:00+00', 'AT&T Stadium, Dallas', 'Semi-finals', 'scheduled'),
    (tbd_qf_w3, tbd_qf_w4, '2026-07-15 21:00:00+00', 'Mercedes-Benz Stadium, Atlanta', 'Semi-finals', 'scheduled');

    -- ============================================
    -- THIRD PLACE MATCH (July 18)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_sf_l1, tbd_sf_l2, '2026-07-18 22:00:00+00', 'Hard Rock Stadium, Miami', 'Third Place', 'scheduled');

    -- ============================================
    -- FINAL (July 19)
    -- ============================================
    INSERT INTO matches (home_team_id, away_team_id, match_date, venue, stage, status) VALUES
    (tbd_sf_w1, tbd_sf_w2, '2026-07-19 20:00:00+00', 'MetLife Stadium, New York', 'Final', 'scheduled');

END $$;
