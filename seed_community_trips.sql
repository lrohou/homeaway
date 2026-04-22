BEGIN;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Rome', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2024-02-27', '2024-03-02', 4, 41.9028, 12.4964, 'Rome, Italie', 840, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Bali', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-08-06', '2025-08-16', 4, -8.4095, 115.1889, 'Bali, Indonésie', 3258, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Séjour détente à Kyoto', 'On s''est laissé porter par l''atmosphère relaxante.', '2025-02-04', '2025-02-14', 4, 35.0116, 135.7681, 'Kyoto, Japon', 1197, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Voyage romantique à Reykjavik', 'Idéal pour des vacances entre amis ou en couple.', '2025-12-03', '2025-12-15', 4, 64.1466, -21.9426, 'Reykjavik, Islande', 1527, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Athènes', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-09-07', '2024-09-19', 4, 37.9838, 23.7275, 'Athènes, Grèce', 2542, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Los Angeles', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2024-09-11', '2024-09-26', 4, 34.0522, -118.2437, 'Los Angeles, USA', 1420, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Los Angeles', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-08-11', '2025-08-22', 4, 34.0522, -118.2437, 'Los Angeles, USA', 2961, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à Los Angeles', 'C''était un voyage concentré sur la gastronomie et les musées.', '2026-01-10', '2026-01-20', 4, 34.0522, -118.2437, 'Los Angeles, USA', 1631, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Rio de Janeiro', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-08-20', '2025-09-03', 4, -22.9068, -43.1729, 'Rio de Janeiro, Brésil', 3435, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Lisbonne', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-07-22', '2024-07-29', 4, 38.7223, -9.1393, 'Lisbonne, Portugal', 2933, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à Vienne', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2024-03-03', '2024-03-22', 4, 48.2082, 16.3738, 'Vienne, Autriche', 2903, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Sydney', 'Idéal pour des vacances entre amis ou en couple.', '2025-12-19', '2025-12-28', 4, -33.8688, 151.2093, 'Sydney, Australie', 3394, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Vancouver', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-06-03', '2024-06-14', 4, 49.2827, -123.1207, 'Vancouver, Canada', 707, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Le Cap', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2024-03-06', '2024-03-23', 4, -33.9249, 18.4241, 'Le Cap, Afrique du Sud', 2570, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Montréal', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2025-08-24', '2025-09-01', 4, 45.5017, -73.5673, 'Montréal, Canada', 1351, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Londres', 'C''était un voyage concentré sur la gastronomie et les musées.', '2024-05-24', '2024-06-11', 4, 51.5074, -0.1278, 'Londres, Angleterre', 1461, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Retraite spirituelle à Londres', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-11-16', '2024-11-21', 4, 51.5074, -0.1278, 'Londres, Angleterre', 843, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Le Cap', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2024-04-24', '2024-05-08', 4, -33.9249, 18.4241, 'Le Cap, Afrique du Sud', 566, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Échappée belle à Kyoto', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2024-07-17', '2024-07-30', 4, 35.0116, 135.7681, 'Kyoto, Japon', 1577, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Athènes', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2025-10-04', '2025-10-23', 4, 37.9838, 23.7275, 'Athènes, Grèce', 538, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Échappée belle à Barcelone', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2025-08-29', '2025-09-16', 4, 41.3851, 2.1734, 'Barcelone, Espagne', 2209, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Lisbonne', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2024-04-19', '2024-05-10', 4, 38.7223, -9.1393, 'Lisbonne, Portugal', 3416, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à Buenos Aires', 'On s''est laissé porter par l''atmosphère relaxante.', '2025-10-15', '2025-10-22', 4, -34.6037, -58.3816, 'Buenos Aires, Argentine', 2628, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Vancouver', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-05-19', '2025-05-22', 4, 49.2827, -123.1207, 'Vancouver, Canada', 3089, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Vancouver', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2024-09-09', '2024-09-29', 4, 49.2827, -123.1207, 'Vancouver, Canada', 3286, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Retraite spirituelle à Bali', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-08-27', '2024-09-13', 4, -8.4095, 115.1889, 'Bali, Indonésie', 2762, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Je ne m''attendais pas à tant de beauté. À voir au moins une fois dans sa vie.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à New York', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-02-22', '2024-03-13', 4, 40.7128, -74.006, 'New York, USA', 3368, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Lisbonne', 'Idéal pour des vacances entre amis ou en couple.', '2024-04-15', '2024-04-20', 4, 38.7223, -9.1393, 'Lisbonne, Portugal', 346, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Vancouver', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-12-27', '2026-01-10', 4, 49.2827, -123.1207, 'Vancouver, Canada', 1436, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Voyage romantique à Barcelone', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2025-05-14', '2025-05-19', 4, 41.3851, 2.1734, 'Barcelone, Espagne', 419, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Voyage romantique à New York', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2025-07-15', '2025-07-27', 4, 40.7128, -74.006, 'New York, USA', 1003, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Voyage romantique à Londres', 'Idéal pour des vacances entre amis ou en couple.', '2024-03-01', '2024-03-10', 4, 51.5074, -0.1278, 'Londres, Angleterre', 1152, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Séoul', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2024-04-23', '2024-05-11', 4, 37.5665, 126.978, 'Séoul, Corée du Sud', 3357, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Retraite spirituelle à Montréal', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-10-02', '2025-10-16', 4, 45.5017, -73.5673, 'Montréal, Canada', 752, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Immersion culturelle à Montréal', 'C''était un voyage concentré sur la gastronomie et les musées.', '2024-03-06', '2024-03-26', 4, 45.5017, -73.5673, 'Montréal, Canada', 2133, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Séoul', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2025-02-09', '2025-02-13', 4, 37.5665, 126.978, 'Séoul, Corée du Sud', 1788, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Vancouver', 'Idéal pour des vacances entre amis ou en couple.', '2024-06-20', '2024-06-28', 4, 49.2827, -123.1207, 'Vancouver, Canada', 3261, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Prague', 'C''était un voyage concentré sur la gastronomie et les musées.', '2026-02-04', '2026-02-09', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 2012, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Prague', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-07-10', '2024-07-17', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 2495, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Berlin', 'Idéal pour des vacances entre amis ou en couple.', '2026-01-18', '2026-01-25', 4, 52.52, 13.405, 'Berlin, Allemagne', 1117, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Buenos Aires', 'On a marché des heures pour visiter tous les monuments historiques.', '2026-01-19', '2026-02-07', 4, -34.6037, -58.3816, 'Buenos Aires, Argentine', 311, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Dépaysement total à Londres', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-02-20', '2025-03-07', 4, 51.5074, -0.1278, 'Londres, Angleterre', 1845, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Bangkok', 'Idéal pour des vacances entre amis ou en couple.', '2025-10-15', '2025-10-24', 4, 13.7563, 100.5018, 'Bangkok, Thaïlande', 2769, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Berlin', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-10-15', '2025-11-02', 4, 52.52, 13.405, 'Berlin, Allemagne', 3041, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Immersion culturelle à Prague', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2026-01-05', '2026-01-10', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 2563, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Reykjavik', 'Idéal pour des vacances entre amis ou en couple.', '2024-04-16', '2024-04-20', 4, 64.1466, -21.9426, 'Reykjavik, Islande', 677, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Séoul', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-05-03', '2025-05-19', 4, 37.5665, 126.978, 'Séoul, Corée du Sud', 2292, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Marrakech', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-08-16', '2024-08-22', 4, 31.6295, -7.9811, 'Marrakech, Maroc', 524, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Reykjavik', 'Idéal pour des vacances entre amis ou en couple.', '2025-02-03', '2025-02-21', 4, 64.1466, -21.9426, 'Reykjavik, Islande', 401, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Le Cap', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-01-14', '2025-01-21', 4, -33.9249, 18.4241, 'Le Cap, Afrique du Sud', 1109, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Istanbul', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-03-17', '2024-03-29', 4, 41.0082, 28.9784, 'Istanbul, Turquie', 1020, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Je ne m''attendais pas à tant de beauté. À voir au moins une fois dans sa vie.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Berlin', 'On s''est laissé porter par l''atmosphère relaxante.', '2024-06-04', '2024-06-14', 4, 52.52, 13.405, 'Berlin, Allemagne', 1911, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à Prague', 'C''était un voyage concentré sur la gastronomie et les musées.', '2024-07-04', '2024-07-10', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 2729, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Los Angeles', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2025-05-26', '2025-05-30', 4, 34.0522, -118.2437, 'Los Angeles, USA', 643, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Berlin', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2025-09-08', '2025-09-28', 4, 52.52, 13.405, 'Berlin, Allemagne', 1224, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Rome', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2024-04-15', '2024-04-22', 4, 41.9028, 12.4964, 'Rome, Italie', 1282, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Dépaysement total à Prague', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2025-05-25', '2025-05-28', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 689, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Rome', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2024-11-09', '2024-11-20', 4, 41.9028, 12.4964, 'Rome, Italie', 581, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Bangkok', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2024-03-05', '2024-03-20', 4, 13.7563, 100.5018, 'Bangkok, Thaïlande', 1453, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Kyoto', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2024-09-02', '2024-09-22', 4, 35.0116, 135.7681, 'Kyoto, Japon', 561, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à Rio de Janeiro', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2025-07-23', '2025-08-10', 4, -22.9068, -43.1729, 'Rio de Janeiro, Brésil', 1854, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Montréal', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2025-04-20', '2025-04-29', 4, 45.5017, -73.5673, 'Montréal, Canada', 3172, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Vienne', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-05-14', '2024-05-31', 4, 48.2082, 16.3738, 'Vienne, Autriche', 623, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Istanbul', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-05-31', '2024-06-15', 4, 41.0082, 28.9784, 'Istanbul, Turquie', 960, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Los Angeles', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2024-12-22', '2025-01-04', 4, 34.0522, -118.2437, 'Los Angeles, USA', 501, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Échappée belle à Paris', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2025-05-04', '2025-05-07', 4, 48.8566, 2.3522, 'Paris, France', 2268, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Séjour détente à Kyoto', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2026-02-03', '2026-02-21', 4, 35.0116, 135.7681, 'Kyoto, Japon', 2212, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Prague', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-05-25', '2025-05-31', 4, 50.0755, 14.4378, 'Prague, République Tchèque', 1624, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Hawaï', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2026-02-07', '2026-02-27', 4, 19.8968, -155.5828, 'Hawaï', 2025, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Échappée belle à Rome', 'Idéal pour des vacances entre amis ou en couple.', '2024-11-17', '2024-12-06', 4, 41.9028, 12.4964, 'Rome, Italie', 1518, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Bangkok', 'Une semaine de pur bonheur avec un emploi du temps bien chargé !', '2025-08-14', '2025-08-26', 4, 13.7563, 100.5018, 'Bangkok, Thaïlande', 1268, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Marrakech', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-04-16', '2024-05-05', 4, 31.6295, -7.9811, 'Marrakech, Maroc', 3192, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Buenos Aires', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2024-04-02', '2024-04-09', 4, -34.6037, -58.3816, 'Buenos Aires, Argentine', 2242, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Amsterdam', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2025-09-16', '2025-09-25', 4, 52.3676, 4.9041, 'Amsterdam, Pays-Bas', 1355, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Buenos Aires', 'On s''est laissé porter par l''atmosphère relaxante.', '2024-04-24', '2024-05-05', 4, -34.6037, -58.3816, 'Buenos Aires, Argentine', 2526, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Barcelone', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2025-09-15', '2025-09-27', 4, 41.3851, 2.1734, 'Barcelone, Espagne', 878, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Une expérience incroyable ! Je recommande fortement tous les endroits visités.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Okinawa', 'Idéal pour des vacances entre amis ou en couple.', '2024-08-26', '2024-09-15', 4, 26.2124, 127.6809, 'Okinawa, Japon', 3311, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Marrakech', 'C''était un voyage concentré sur la gastronomie et les musées.', '2024-09-14', '2024-09-18', 4, 31.6295, -7.9811, 'Marrakech, Maroc', 2171, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Immersion culturelle à Istanbul', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2024-11-04', '2024-11-23', 4, 41.0082, 28.9784, 'Istanbul, Turquie', 2029, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Tokyo', 'Idéal pour des vacances entre amis ou en couple.', '2024-09-22', '2024-10-04', 4, 35.6762, 139.6503, 'Tokyo, Japon', 2631, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Le rapport qualité-prix des activités était top. On n''a pas eu le temps de s''ennuyer.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Evasion fantastique en Kyoto', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-05-07', '2025-05-21', 4, 35.0116, 135.7681, 'Kyoto, Japon', 2746, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Marrakech', 'Idéal pour des vacances entre amis ou en couple.', '2025-01-31', '2025-02-15', 4, 31.6295, -7.9811, 'Marrakech, Maroc', 3136, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'La météo était parfaite, les activités très bien organisées. Un sans-faute.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Vienne', 'On a marché des heures pour visiter tous les monuments historiques.', '2024-02-28', '2024-03-02', 4, 48.2082, 16.3738, 'Vienne, Autriche', 1713, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Semaine de rêve à Vancouver', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2024-04-07', '2024-04-18', 4, 49.2827, -123.1207, 'Vancouver, Canada', 460, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Rome', 'C''était un voyage concentré sur la gastronomie et les musées.', '2025-01-31', '2025-02-06', 4, 41.9028, 12.4964, 'Rome, Italie', 2709, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Rio de Janeiro', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2025-03-14', '2025-03-22', 4, -22.9068, -43.1729, 'Rio de Janeiro, Brésil', 2412, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'L''une des meilleures destinations que j''ai pu visiter. Les paysages étaient à couper le souffle.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Séjour détente à Sydney', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2025-01-21', '2025-02-09', 4, -33.8688, 151.2093, 'Sydney, Australie', 1525, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Road trip autour de Paris', 'Les conseils de la communauté nous ont permis d''organiser ce super séjour.', '2025-02-19', '2025-02-22', 4, 48.8566, 2.3522, 'Paris, France', 1453, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000', 'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Lisbonne', 'On est sortis des sentiers battus pour découvrir l''authenticité locale.', '2025-07-25', '2025-08-05', 4, 38.7223, -9.1393, 'Lisbonne, Portugal', 2327, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000', 'Je ne m''attendais pas à tant de beauté. À voir au moins une fois dans sa vie.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Escale gourmande à Rome', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2025-10-17', '2025-11-01', 4, 41.9028, 12.4964, 'Rome, Italie', 1446, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000', 'Je ne m''attendais pas à tant de beauté. À voir au moins une fois dans sa vie.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Sydney', 'Beaucoup de route et de paysages variés, un vrai dépaysement.', '2026-01-21', '2026-02-11', 4, -33.8688, 151.2093, 'Sydney, Australie', 1578, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Retraite spirituelle à Kyoto', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2024-11-08', '2024-11-28', 4, 35.0116, 135.7681, 'Kyoto, Japon', 930, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Un vrai coup de cœur, je compte bien y retourner très bientôt !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Reykjavik', 'Parfait mélange entre nature sauvage et découvertes urbaines modernes.', '2026-01-17', '2026-01-30', 4, 64.1466, -21.9426, 'Reykjavik, Islande', 3393, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Marrakech', 'On s''est laissé porter par l''atmosphère relaxante.', '2024-09-30', '2024-10-05', 4, 31.6295, -7.9811, 'Marrakech, Maroc', 1220, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000', 'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Los Angeles', 'On a marché des heures pour visiter tous les monuments historiques.', '2025-03-09', '2025-03-24', 4, 34.0522, -118.2437, 'Los Angeles, USA', 2479, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Merveilles cachées de Barcelone', 'Idéal pour des vacances entre amis ou en couple.', '2025-06-24', '2025-07-10', 4, 41.3851, 2.1734, 'Barcelone, Espagne', 2048, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000', 'C''était juste parfait. Tout s''est déroulé comme prévu.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Vacances exceptionnelles à Paris', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2024-11-23', '2024-11-30', 4, 48.8566, 2.3522, 'Paris, France', 938, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'Très reposant, exactement ce dont j''avais besoin pour décompresser.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Inoubliable aventure à Dubaï', 'On s''est laissé porter par l''atmosphère relaxante.', '2024-09-23', '2024-10-06', 4, 25.2048, 55.2708, 'Dubaï, Émirats Arabes Unis', 2046, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000', 'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Découverte magique de Amsterdam', 'Au programme : visites, repas copieux et rencontres inoubliables.', '2025-12-05', '2025-12-18', 4, 52.3676, 4.9041, 'Amsterdam, Pays-Bas', 524, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000', 'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.' FROM new_trip;

WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('Exploration urbaine à New York', 'On s''est laissé porter par l''atmosphère relaxante.', '2024-06-12', '2024-06-21', 4, 40.7128, -74.006, 'New York, USA', 2848, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000', 'Je ne m''attendais pas à tant de beauté. À voir au moins une fois dans sa vie.' FROM new_trip;

COMMIT;
