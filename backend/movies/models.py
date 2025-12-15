from django.db import models
from django_countries.fields import CountryField
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta

class Director(models.Model):
    name = models.CharField(max_length=100)
    country = CountryField()

    def clean(self):
        if Director.objects.filter(name__iexact=self.name).exclude(id=self.id).exists():
            raise ValidationError('Director already exists')

    @property
    def total_movies(self):
        return self.movies.count()

    def __str__(self):
        return self.name
    
class Actor(models.Model):
    name = models.CharField(max_length=100)
    country = CountryField()

    def clean(self):
        if Actor.objects.filter(name__iexact=self.name).exclude(id=self.id).exists():
            raise ValidationError('Actor already exists')

    @property
    def total_movies(self):
        return self.movies.count()

    def __str__(self):
        return self.name

class Movie(models.Model):
    title = models.CharField(max_length=200, blank=False, null=False)
    year = models.IntegerField(blank=True, null=True)
    genres = ArrayField(models.CharField(max_length=100), default=list, blank=True, help_text='Movie genres list')
    rating = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    poster_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    director = models.ForeignKey(Director, on_delete=models.CASCADE, related_name='movies')
    actors = models.ManyToManyField(Actor, related_name='movies')

    def clean(self):
        if Movie.objects.filter(title__iexact=self.title).exclude(id=self.id).exists():
            raise ValidationError({'title': 'Movie already exists'})

        current_year = datetime.now().year

        if self.year is None or not (1880 <= self.year <= current_year):
            raise ValidationError({"year": "Invalid release year. It must be after 1880 and not in the future."})

        if self.rating is None or not (1 <= self.rating <= 10):
            raise ValidationError({'rating': 'Rate must be between 1 and 10'})

    def __str__(self):
        return self.title


    