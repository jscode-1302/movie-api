import pytest
from unittest import mock
from rest_framework.exceptions import ValidationError
from ..serializers import DirectorSerializer, ActorSerializer, MovieSerializer
from ..models import Movie, Actor

@pytest.mark.django_db
def test_valid_director_data():
    data = {'name': 'Director Test', 'country': 'US'}
    serializer = DirectorSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data['name']=='Director Test'

@pytest.mark.django_db
def test_valid_actor_data():
    data = {'name': 'Actor Test', 'country': 'US'}
    serializer = ActorSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data['name']=='Actor Test'

@pytest.mark.django_db
def test_create_movie(movie_serializer):
    movie = movie_serializer

    assert movie.title=='Movie Test'
    assert movie.year==2025
    assert movie.actors.count()==1

@pytest.mark.django_db
@mock.patch("movies.serializers.fetch_movie_data")
def test_create_movie_with_mocked_tmdb(mock_fetch, director, actor):

    mock_fetch.return_value = {
        "year": 2000,
        "genres": ["Action"],
        "description": "Mocked description",
        "poster_url": "http://example.com/poster.jpg",
        "rating": 9.1
    }

    data = {
        "title": "Movie Test",
        "director": director.id,
        "actors_id": [actor.id]
    }

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    movie = serializer.save()

    assert movie.title == "Movie Test"  
    assert movie.year == 2000  
    assert mock_fetch.called

@pytest.mark.django_db
def test_create_movie_from_tmdb(director, actor):
    data = {'title': 'Inception', 'director': director.id, 'actors_id': [actor.id]}

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    movie = serializer.save()

    assert movie.title=='Inception'
    assert 1 <= movie.rating <= 10
    assert 'Cobb, a skilled thief' in movie.description

@pytest.mark.django_db
def test_duplicate_director_name(director_serializer):
    with pytest.raises(ValidationError):
        data = {'name': 'Director Test', 'country': 'US'}
        serializer = DirectorSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_duplicate_actor_name(actor_serializer):
    with pytest.raises(ValidationError):
        data = {'name': 'Actor Test', 'country': 'US'}
        serializer = ActorSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_duplicate_movie_title(movie_serializer, director, actor):
    with pytest.raises(ValidationError):
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

@pytest.mark.django_db
def test_future_movie_year(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": 2026,
            "genres": ["Action"],
            "rating": 9.1,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_too_old_movie_year(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": 1500,
            "genres": ["Action"],
            "rating": 9.1,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_negative_movie_year(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": -2025,
            "genres": ["Action"],
            "rating": 9.1,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_over_ten_movie_rating(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": 2025,
            "genres": ["Action"],
            "rating": 11,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_under_one_movie_rating(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": 2025,
            "genres": ["Action"],
            "rating": 0,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_negative_movie_rating(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "title": "Movie Test",
            "year": 2025,
            "genres": ["Action"],
            "rating": -2,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_lower_limit_movie_rating(director, actor):
    data = {
        "title": "Movie Test",
        "year": 2025,
        "genres": ["Action"],
        "rating": 1,
        "description": "Movie test description",
        "poster_url": "http://example.com/poster.jpg",
        "director": director.id,
        "actors_id": [actor.id],        
    }

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    movie = serializer.save()

    assert movie.rating==1

@pytest.mark.django_db
def test_highest_limit_movie_rating(director, actor):
    data = {
        "title": "Movie Test",
        "year": 2025,
        "genres": ["Action"],
        "rating": 10,
        "description": "Movie test description",
        "poster_url": "http://example.com/poster.jpg",
        "director": director.id,
        "actors_id": [actor.id],        
    }

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    movie = serializer.save()

    assert movie.rating==10

@pytest.mark.django_db
def test_missing_movie_title(director, actor):
    with pytest.raises(ValidationError):
        data = {
            "year": 2025,
            "genres": ["Action"],
            "rating": 10,
            "description": "Movie test description",
            "poster_url": "http://example.com/poster.jpg",
            "director": director.id,
            "actors_id": [actor.id],        
        }

        serializer = MovieSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_missing_director_name():
    with pytest.raises(ValidationError):
        data = {
            'country':'US'
        }

        serializer = DirectorSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_missing_actor_name():
    with pytest.raises(ValidationError):
        data = {'country':'US'}

        serializer = ActorSerializer(data=data)
        serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_wrong_iso_country_code():
    with pytest.raises(ValidationError):
        data = {'name': 'Director Test', 'country': 'USA'}

        serializer = DirectorSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
@pytest.mark.django_db
def test_read_only_created_at_field(director, actor):
    data = {
        "title": "Movie Test",
        "year": 2025,
        "genres": ["Action"],
        "rating": 10,
        "description": "Movie test description",
        "poster_url": "http://example.com/poster.jpg",
        "director": director.id,
        "actors_id": [actor.id],
        "created_at": "2025-11-01T00:00:00Z"    
    }

    serializer = MovieSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    movie = serializer.save()

    assert movie.created_at!="2025-11-01T00:00:00Z"
    assert 'created_at' not in serializer.validated_data

@pytest.mark.django_db
def test_read_only_total_movies_field():
    data = {'name': 'Director Test', 'country': 'US', 'total_movies': 5}

    serializer = DirectorSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    director = serializer.save()

    assert director.total_movies==0
    assert 'total_movies' not in serializer.validated_data

@pytest.mark.django_db
def test_update_movie_with_actors(director, actor):
    movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=8.5, director=director)

    movie.actors.add(actor)

    new_actor = Actor.objects.create(name='New Actor')

    data = {
        "title": "Updated Title",
        "year": 2024,
        "actors_id": [new_actor.id],
    }

    serializer = MovieSerializer(instance=movie, data=data, partial=True)
    assert serializer.is_valid(), serializer.errors
    updated_movie = serializer.save()

    assert updated_movie.title=='Updated Title'
    assert updated_movie.year==2024
    assert list(updated_movie.actors.all()) == [new_actor]