import pytest
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from movies.models import Movie, Director, Actor

@pytest.mark.django_db
def test_register(client):
    data = {'username': 'Test', 'email': 'test@gmail.com', 'password': 'test123'}
    response = client.post('/api/auth/register/', data, format='json')

    assert response.status_code==201

@pytest.mark.django_db
def test_login(client, user):
    username = user.username
    password = 'test123'
    data = {'username': username, 'password': password}

    response = client.post('/api/auth/login/', data, format='json')

    assert response.status_code==200
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_logout(client, user_tokens):
    data = {'refresh':user_tokens['refresh']}
    response = client.post('/api/auth/logout/', data, format='json')

    assert response.status_code==200
    assert response.data['success']==True
    assert 'Logout successful' in response.data['message']

@pytest.mark.django_db
def test_refresh(client, user_tokens):
    data = {'refresh': user_tokens['refresh']}
    response = client.post('/api/auth/refresh/', data, format='json')

    assert response.status_code==200
    assert 'access' in response.data
    assert 'refresh' in response.data 

@pytest.mark.django_db
def test_list_movies_no_results(client):
    response = client.get('/api/movies/')

    assert response.status_code==200
    assert len(response.data)==0 # empty

@pytest.mark.django_db
def test_list_movies_with_results(client, movie):
    response = client.get('/api/movies/')

    assert response.status_code==200
    assert response.data[0]['title']=='Movie test'
    assert len(response.data)==1
    assert len(response.data[0]['actors_data'])==1

@pytest.mark.django_db
def test_create_movie_full_data(authenticated_client, director, actor):
    data = {
        'title': 'Movie Test',
        'year': 2025,
        'genres': ['Drama', 'Adventure'],
        'rating': 8.5,
        'description': 'Movie Test description',
        'poster_url': 'https://ejemplo.com',
        'director': director.id,
        'actors_id': [actor.id]
    }

    response = authenticated_client.post('/api/movies/', data, format='json')

    assert response.status_code==201
    assert response.data['title']=='Movie Test'

@pytest.mark.django_db
def test_create_movie_from_tmdb(authenticated_client, director, actor):
    data = {
        'title': 'Oppenheimer',
        'director': director.id,
        'actors_id': [actor.id]
    }

    response = authenticated_client.post('/api/movies/', data, format='json')

    assert response.status_code==201
    assert response.data['title']=='Oppenheimer'
    assert response.data['year']==2023
    assert 'The story of J. Robert Oppenheimer' in response.data['description']
    assert len(response.data['genres'])>1

@pytest.mark.django_db
def test_filter_movie(authenticated_client, movie, director, actor):
    data = {
        'title': 'Oppenheimer',
        'director': director.id,
        'actors_id': [actor.id]
    }
    authenticated_client.post('/api/movies/', data, format='json')

    response = authenticated_client.get('/api/movies/?title=Oppenheimer')

    assert response.status_code==200
    assert response.data[0]['title']=='Oppenheimer'
    assert len(response.data)==1

@pytest.mark.django_db
def test_movie_details(client, movie):
    response = client.get(f'/api/movies/{movie.id}/')

    assert response.status_code==200
    assert response.data['title']=='Movie test'
    assert 'Drama' in response.data['genres']
    assert len(response.data['actors_data'])==1

@pytest.mark.django_db
def test_update_movie(authenticated_client, movie, director):
    data = {
        'title': 'Updated Movie',
        'year': 2024,
        'genres': ['Action', 'Thriller'],
        'rating': 9.0,
        'director': director.id,
        'actors_id': []
    }

    response = authenticated_client.put(f'/api/movies/{movie.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['title']=='Updated Movie'
    assert response.data['year']==2024
    assert 'Action' in response.data['genres']
    assert response.data['rating']==9.0

@pytest.mark.django_db
def test_partial_update_movie(authenticated_client, movie):
    data = {'title': 'Partially Updated Movie'}

    response = authenticated_client.patch(f'/api/movies/{movie.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['title']=='Partially Updated Movie'
    assert response.data['year']==2025  # unchanged

@pytest.mark.django_db
def test_delete_movie(authenticated_client, movie):
    movie_id = movie.id
    response = authenticated_client.delete(f'/api/movies/{movie_id}/')

    assert response.status_code==204

    # Verify movie is deleted
    response = authenticated_client.get(f'/api/movies/{movie_id}/')
    assert response.status_code==404

# DIRECTOR TESTS
@pytest.mark.django_db
def test_list_directors_empty(client):
    response = client.get('/api/directors/')

    assert response.status_code==200
    assert len(response.data)==0

@pytest.mark.django_db
def test_list_directors_with_results(client, director):
    response = client.get('/api/directors/')

    assert response.status_code==200
    assert len(response.data)==1
    assert response.data[0]['name']=='Director Test'
    assert response.data[0]['country']=='US'

@pytest.mark.django_db
def test_create_director(authenticated_client):
    data = {'name': 'New Director', 'country': 'GB'}
    response = authenticated_client.post('/api/directors/', data, format='json')

    assert response.status_code==201
    assert response.data['name']=='New Director'
    assert response.data['country']=='GB'

@pytest.mark.django_db
def test_director_details(client, director):
    response = client.get(f'/api/directors/{director.id}/')

    assert response.status_code==200
    assert response.data['name']=='Director Test'
    assert response.data['country']=='US'

@pytest.mark.django_db
def test_update_director(authenticated_client, director):
    data = {'name': 'Updated Director', 'country': 'CA'}
    response = authenticated_client.put(f'/api/directors/{director.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['name']=='Updated Director'
    assert response.data['country']=='CA'

@pytest.mark.django_db
def test_partial_update_director(authenticated_client, director):
    data = {'name': 'Partially Updated Director'}
    response = authenticated_client.patch(f'/api/directors/{director.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['name']=='Partially Updated Director'
    assert response.data['country']=='US'  # unchanged

@pytest.mark.django_db
def test_delete_director(authenticated_client, director):
    director_id = director.id
    response = authenticated_client.delete(f'/api/directors/{director_id}/')

    assert response.status_code==204

    # Verify director is deleted
    response = authenticated_client.get(f'/api/directors/{director_id}/')
    assert response.status_code==404

# ACTOR TESTS
@pytest.mark.django_db
def test_list_actors_empty(client):
    response = client.get('/api/actors/')

    assert response.status_code==200
    assert len(response.data)==0

@pytest.mark.django_db
def test_list_actors_with_results(client, actor):
    response = client.get('/api/actors/')

    assert response.status_code==200
    assert len(response.data)==1
    assert response.data[0]['name']=='Actor Test'
    assert response.data[0]['country']=='US'

@pytest.mark.django_db
def test_create_actor(authenticated_client):
    data = {'name': 'New Actor', 'country': 'FR'}
    response = authenticated_client.post('/api/actors/', data, format='json')

    assert response.status_code==201
    assert response.data['name']=='New Actor'
    assert response.data['country']=='FR'

@pytest.mark.django_db
def test_actor_details(client, actor):
    response = client.get(f'/api/actors/{actor.id}/')

    assert response.status_code==200
    assert response.data['name']=='Actor Test'
    assert response.data['country']=='US'

@pytest.mark.django_db
def test_update_actor(authenticated_client, actor):
    data = {'name': 'Updated Actor', 'country': 'ES'}
    response = authenticated_client.put(f'/api/actors/{actor.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['name']=='Updated Actor'
    assert response.data['country']=='ES'

@pytest.mark.django_db
def test_partial_update_actor(authenticated_client, actor):
    data = {'country': 'MX'}
    response = authenticated_client.patch(f'/api/actors/{actor.id}/', data, format='json')

    assert response.status_code==200
    assert response.data['name']=='Actor Test'  # unchanged
    assert response.data['country']=='MX'

@pytest.mark.django_db
def test_delete_actor(authenticated_client, actor):
    actor_id = actor.id
    response = authenticated_client.delete(f'/api/actors/{actor_id}/')

    assert response.status_code==204

    # Verify actor is deleted
    response = authenticated_client.get(f'/api/actors/{actor_id}/')
    assert response.status_code==404

# PERMISSION TESTS
@pytest.mark.django_db
def test_create_movie_unauthorized(client, director, actor):
    data = {
        'title': 'Unauthorized Movie',
        'year': 2025,
        'genres': ['Drama'],
        'rating': 7.0,
        'director': director.id,
        'actors_id': [actor.id]
    }
    response = client.post('/api/movies/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_update_movie_unauthorized(client, movie):
    data = {'title': 'Unauthorized Update'}
    response = client.put(f'/api/movies/{movie.id}/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_delete_movie_unauthorized(client, movie):
    response = client.delete(f'/api/movies/{movie.id}/')

    assert response.status_code==401

@pytest.mark.django_db
def test_create_director_unauthorized(client):
    data = {'name': 'Unauthorized Director', 'country': 'US'}
    response = client.post('/api/directors/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_update_director_unauthorized(client, director):
    data = {'name': 'Unauthorized Update'}
    response = client.put(f'/api/directors/{director.id}/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_delete_director_unauthorized(client, director):
    response = client.delete(f'/api/directors/{director.id}/')

    assert response.status_code==401

@pytest.mark.django_db
def test_create_actor_unauthorized(client):
    data = {'name': 'Unauthorized Actor', 'country': 'US'}
    response = client.post('/api/actors/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_update_actor_unauthorized(client, actor):
    data = {'name': 'Unauthorized Update'}
    response = client.put(f'/api/actors/{actor.id}/', data, format='json')

    assert response.status_code==401

@pytest.mark.django_db
def test_delete_actor_unauthorized(client, actor):
    response = client.delete(f'/api/actors/{actor.id}/')

    assert response.status_code==401


