import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.utils import DataError, IntegrityError
from datetime import datetime
from ..models import Movie, Director, Actor


@pytest.mark.django_db
def test_create_user(user):
    assert user.username=='test'
    assert user.email=='test@gmail.com'
    assert user.check_password('test123')

@pytest.mark.django_db
def test_create_director(director):
    assert director.name=='Director Test'
    assert director.country=='US'

@pytest.mark.django_db
def test_create_actor(actor):
    assert actor.name=='Actor Test'
    assert actor.country=='US'

@pytest.mark.django_db
def test_create_movie(movie):
    assert movie.title=='Movie test'
    assert movie.year==2025
    assert 'Drama' in movie.genres
    assert movie.rating==8.5
    assert movie.director.name=='Director Test'
    assert movie.director.total_movies==1
    assert movie.actors.count()==1

    actors = movie.actors.get(name='Actor Test')
    assert actors.total_movies==1

@pytest.mark.django_db
def test_country_error_too_long():
    with pytest.raises(DataError):
        Director.objects.create(name='Test', country='United States')

@pytest.mark.django_db
def test_wrong_iso_country():
    with pytest.raises(ValidationError):
        director = Director.objects.create(name='Test', country='QQ')
        director.full_clean()

@pytest.mark.django_db
def test_duplicate_actor(actor):
    with pytest.raises(ValidationError):
        duplicate_actor = Actor.objects.create(name='Actor Test', country='US')
        duplicate_actor.full_clean()

@pytest.mark.django_db
def test_duplicate_director(director):
    with pytest.raises(ValidationError):
        duplicate_director = Director.objects.create(name='Director Test', country='US')
        duplicate_director.full_clean()

@pytest.mark.django_db
def test_duplicate_movie_title(movie, director):
    with pytest.raises(ValidationError):
        duplicate_title = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=8.5, director=director)
        duplicate_title.full_clean()

@pytest.mark.django_db
def test_future_movie_year(director):
    with pytest.raises(ValidationError):
        movie = Movie.objects.create(title='Movie test', year=2026, genres=['Drama'], rating=8.5, director=director)
        movie.full_clean()

@pytest.mark.django_db
def test_create_movie_missing_info():
    with pytest.raises(IntegrityError):
        movie = Movie.objects.create(title='Movie test')
        movie.full_clean()

@pytest.mark.django_db
def test_wrong_int_rating(director):
    with pytest.raises(ValidationError):
        movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=11, director=director)
        movie.full_clean()

@pytest.mark.django_db
def test_wrong_float_rating(director):
    with pytest.raises(ValidationError):
        movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=10.5, director=director)
        movie.full_clean()

@pytest.mark.django_db
def test_right_rating(director):
    movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=1, director=director)
    movie_2 = Movie.objects.create(title='Movie test 2', year=2025, genres=['Drama'], rating=5.5, director=director)
    movie_3 = Movie.objects.create(title='Movie test 3', year=2025, genres=['Drama'], rating=10, director=director)

    movie.full_clean()
    movie_2.full_clean()
    movie_3.full_clean()

    assert movie.rating==1
    assert movie_2.rating==5.5
    assert movie_3.rating==10

@pytest.mark.django_db
def test_optional_fields(director):
    movie = Movie.objects.create(title='Movie test', year=2025, genres=['Drama'], rating=1, description='This is a description for Movie Test', poster_url='https://www.urlexample.com', director=director)

    assert movie.description=='This is a description for Movie Test'
    assert movie.poster_url=='https://www.urlexample.com'
    assert movie.created_at.day==datetime.now().day
    assert movie.updated_at.day==datetime.now().day

@pytest.mark.django_db
def test_create_movie_several_actors(movie, actor):
    actor_2 = Actor.objects.create(name='Actor Test 2', country='US')
    actor_3 = Actor.objects.create(name='Actor Test 3', country='US')

    movie.actors.add(actor_2, actor_3)

    assert movie.actors.count()==3

    actors_name = []
    for actor in movie.actors.all():
        actors_name.append(actor.name)

    assert ['Actor Test', 'Actor Test 2', 'Actor Test 3']==actors_name

@pytest.mark.django_db
def test_movie_str_method(movie):
    assert str(movie)==movie.title

@pytest.mark.django_db
def test_director_str_method(director):
    assert str(director)==director.name

@pytest.mark.django_db
def test_actor_str_method(actor):
    assert str(actor)==actor.name

@pytest.mark.django_db
def test_zero_total_movies(director, actor):
    assert director.total_movies==0
    assert actor.total_movies==0

@pytest.mark.django_db
def test_multiple_total_movies(movie, director):
    movie_2 = Movie.objects.create(title='Movie test 2', year=2025, genres=['Drama'], rating=8.5, director=director)
    movie_3 = Movie.objects.create(title='Movie test 3', year=2025, genres=['Drama'], rating=9.5, director=director)

    assert director.total_movies==3

@pytest.mark.django_db
def test_duplicate_movie_title_insensitive(movie, director):
    with pytest.raises(ValidationError):
        duplicate_title = Movie.objects.create(title='movie test', year=2025, genres=['Drama'], director=director)

        duplicate_title.full_clean()