import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from movies.models import Movie, Director, Actor
from movies.serializers import DirectorSerializer, ActorSerializer, MovieSerializer

@pytest.fixture
def user():
    return User.objects.create_user(username='test', email='test@gmail.com', password='test123')

@pytest.fixture
def director():
    return Director.objects.create(name='Director Test', country='US')

@pytest.fixture
def actor():
    return Actor.objects.create(name='Actor Test', country='US')

@pytest.fixture
def movie(director, actor):
    movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=8.5, director=director)
    movie.actors.add(actor)
    return movie

@pytest.fixture
def client():
    return APIClient()

@pytest.fixture
def authenticated_client(client, user):
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def director_serializer():
    data = {'name': 'Director Test', 'country': 'US'}
    serializer = DirectorSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()

@pytest.fixture
def actor_serializer():
    data = {'name': 'Actor Test', 'country': 'US'}
    serializer = ActorSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()

@pytest.fixture
def movie_serializer(director, actor):
    data = {
        "title": "Movie Test",
        "year": 2025,
        "genres": ["Action"],
        "rating": 9.1,
        "description": "Movie test description",
        "poster_url": "http://example.com/poster.jpg",
        "director": director.id,
        "actors_id": [actor.id],        
    }

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()

@pytest.fixture
def user_tokens(client, user):
    username = user.username
    password = 'test123'
    data = {'username': username, 'password': password}

    response = client.post('/api/auth/login/', data, format='json')

    return {'refresh': response.data['refresh'], 'access': response.data['access']}