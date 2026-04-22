import random
from datetime import datetime, timedelta

destinations = [
  {"name": 'Paris, France', "lat": 48.8566, "lng": 2.3522},
  {"name": 'Rome, Italie', "lat": 41.9028, "lng": 12.4964},
  {"name": 'Tokyo, Japon', "lat": 35.6762, "lng": 139.6503},
  {"name": 'New York, USA', "lat": 40.7128, "lng": -74.0060},
  {"name": 'Londres, Angleterre', "lat": 51.5074, "lng": -0.1278},
  {"name": 'Barcelone, Espagne', "lat": 41.3851, "lng": 2.1734},
  {"name": 'Sydney, Australie', "lat": -33.8688, "lng": 151.2093},
  {"name": 'Montréal, Canada', "lat": 45.5017, "lng": -73.5673},
  {"name": 'Rio de Janeiro, Brésil', "lat": -22.9068, "lng": -43.1729},
  {"name": 'Le Cap, Afrique du Sud', "lat": -33.9249, "lng": 18.4241},
  {"name": 'Berlin, Allemagne', "lat": 52.5200, "lng": 13.4050},
  {"name": 'Kyoto, Japon', "lat": 35.0116, "lng": 135.7681},
  {"name": 'Los Angeles, USA', "lat": 34.0522, "lng": -118.2437},
  {"name": 'Lisbonne, Portugal', "lat": 38.7223, "lng": -9.1393},
  {"name": 'Bangkok, Thaïlande', "lat": 13.7563, "lng": 100.5018},
  {"name": 'Okinawa, Japon', "lat": 26.2124, "lng": 127.6809},
  {"name": 'Bali, Indonésie', "lat": -8.4095, "lng": 115.1889},
  {"name": 'Reykjavik, Islande', "lat": 64.1466, "lng": -21.9426},
  {"name": 'Athènes, Grèce', "lat": 37.9838, "lng": 23.7275},
  {"name": 'Dubaï, Émirats Arabes Unis', "lat": 25.2048, "lng": 55.2708},
  {"name": 'Istanbul, Turquie', "lat": 41.0082, "lng": 28.9784},
  {"name": 'Amsterdam, Pays-Bas', "lat": 52.3676, "lng": 4.9041},
  {"name": 'Prague, République Tchèque', "lat": 50.0755, "lng": 14.4378},
  {"name": 'Vienne, Autriche', "lat": 48.2082, "lng": 16.3738},
  {"name": 'Buenos Aires, Argentine', "lat": -34.6037, "lng": -58.3816},
  {"name": 'Vancouver, Canada', "lat": 49.2827, "lng": -123.1207},
  {"name": 'Marrakech, Maroc', "lat": 31.6295, "lng": -7.9811},
  {"name": 'Séoul, Corée du Sud', "lat": 37.5665, "lng": 126.9780},
  {"name": 'Hawaï', "lat": 19.8968, "lng": -155.5828},
  {"name": 'Zanzibar, Tanzanie', "lat": -6.1659, "lng": 39.2026}
]

adjectives = [
  'Inoubliable aventure à', 'Découverte magique de', 'Exploration urbaine à', 
  'Voyage romantique à', 'Séjour détente à', 'Escale gourmande à', 'Immersion culturelle à', 
  'Road trip autour de', 'Retraite spirituelle à', 'Échappée belle à', 'Merveilles cachées de',
  'Semaine de rêve à', 'Vacances exceptionnelles à', 'Evasion fantastique en', 'Dépaysement total à'
]

comments = [
  'Une expérience incroyable ! Je recommande fortement tous les endroits visités.',
  'Un voyage parfait du début à la fin. Les logements étaient magnifiques et le budget a été respecté.',
  'Superbe destination, la nourriture était délicieuse et les locaux très accueillants.',
  'Un séjour inoubliable, idéal pour se ressourcer et découvrir de nouvelles cultures.',
  'C\'était juste parfait. Tout s\'est déroulé comme prévu.',
  'L\'une des meilleures destinations que j\'ai pu visiter. Les paysages étaient à couper le souffle.',
  'Un vrai coup de cœur, je compte bien y retourner très bientôt !',
  'Le rapport qualité-prix des activités était top. On n\'a pas eu le temps de s\'ennuyer.',
  'Un peu fatigant mais ça en valait tellement la peine ! Chaque jour était une nouvelle aventure.',
  'Très reposant, exactement ce dont j\'avais besoin pour décompresser.',
  'Les gens étaient incroyablement gentils. Une de mes meilleures découvertes !',
  'Je ne m\'attendais pas à tant de beauté. À voir au moins une fois dans sa vie.',
  'La météo était parfaite, les activités très bien organisées. Un sans-faute.'
]

descriptions = [
  'On a marché des heures pour visiter tous les monuments historiques.',
  'C\'était un voyage concentré sur la gastronomie et les musées.',
  'Parfait mélange entre nature sauvage et découvertes urbaines modernes.',
  'Une semaine de pur bonheur avec un emploi du temps bien chargé !',
  'Idéal pour des vacances entre amis ou en couple.',
  'On est sortis des sentiers battus pour découvrir l\'authenticité locale.',
  'On s\'est laissé porter par l\'atmosphère relaxante.',
  'Au programme : visites, repas copieux et rencontres inoubliables.',
  'Les conseils de la communauté nous ont permis d\'organiser ce super séjour.',
  'Beaucoup de route et de paysages variés, un vrai dépaysement.'
]

cover_images = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&q=80&w=1000'
]

sql = "BEGIN;\n\n"

for i in range(1, 101):
    dest = random.choice(destinations)
    city_name = dest['name'].split(',')[0]
    title = f"{random.choice(adjectives)} {city_name}"
    desc = random.choice(descriptions).replace("'", "''")
    budget = random.randint(300, 3500)
    image = random.choice(cover_images)
    comment = random.choice(comments).replace("'", "''")
    
    days_offset = random.randint(-800, -10)
    start_date = datetime.now() + timedelta(days=days_offset)
    duration = random.randint(3, 21)
    end_date = start_date + timedelta(days=duration)
    
    sql += f"""WITH new_trip AS (
  INSERT INTO trips (name, description, start_date, end_date, owner_id, location_lat, location_lng, location_name, budget, status, is_public)
  VALUES ('{title.replace("'", "''")}', '{desc}', '{start_date.strftime('%Y-%m-%d')}', '{end_date.strftime('%Y-%m-%d')}', 4, {dest['lat']}, {dest['lng']}, '{dest['name'].replace("'", "''")}', {budget}, 'past', 1)
  RETURNING id
)
INSERT INTO shared_trips (trip_id, user_id, share_accommodations, share_transports, share_activities, cover_image, comments)
SELECT id, 4, true, true, true, '{image}', '{comment}' FROM new_trip;

"""

sql += "COMMIT;\n"

with open("seed_community_trips.sql", "w", encoding="utf-8") as f:
    f.write(sql)
