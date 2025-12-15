import requests
from django.conf import settings

TMDB_BASE = 'https://api.themoviedb.org/3'
TMDB_KEY = settings.TMDB_API_KEY

# simple cache for genres. Avoids to call every time to TMDB
GENRE_CACHE = {}

def get_genre_map():
    if GENRE_CACHE:
        return GENRE_CACHE
    
    url = f"{TMDB_BASE}/genre/movie/list"
    params = {"api_key": TMDB_KEY, 'language': 'en-EN'}

    resp= requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json().get('genres', [])

    GENRE_CACHE.update({g['id']: g['name'] for g in data})
    return GENRE_CACHE

def fetch_movie_data(title):
    url = f'{TMDB_BASE}/search/movie'
    params = {"api_key": TMDB_KEY, 'query':title, 'language': 'en-EN'}

    resp = requests.get(url, params=params)
    resp.raise_for_status()
    results = resp.json().get('results')

    if not results:
        return {}
    
    movie = results[0]
    
    genre_map = get_genre_map()
    genres = [genre_map[g] for g in movie.get('genre_ids', []) if g in genre_map]

    return {
        "title": movie.get("title"),
        "year": movie.get('release_date', "")[:4],
        "genres": genres,
        "description": movie.get('overview'),
        "poster_url": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get("poster_path") else None,
        "rating": movie.get('vote_average')
    }