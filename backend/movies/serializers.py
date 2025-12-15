from datetime import datetime
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample
from .models import Movie, Director, Actor
from .services import fetch_movie_data

class DirectorSerializer(serializers.ModelSerializer):
    total_movies = serializers.SerializerMethodField()

    class Meta:
        model = Director
        fields = ['id', 'name', 'country', 'total_movies']

        read_only_fields = ['id']

    def get_total_movies(self, obj):
        return obj.total_movies
    
    def validate(self, data):
        """Validates duplicate name"""
        name = data.get('name')

        if not self.instance and name:
            existing_director = Director.objects.filter(name=name).exclude(id=data.get('id')).exists()

            if existing_director:
                raise serializers.ValidationError(
                    f"Director already exists"
                )
        
        return data


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Data Sample",
            value={
                'name': 'Brad Pitt',
                'country': 'US'
            }
        )
    ]
)
class ActorSerializer(serializers.ModelSerializer):
    total_movies = serializers.SerializerMethodField()

    class Meta:
        model = Actor
        fields = ['id', 'name', 'country', 'total_movies']

        read_only_fields = ['id']

    def get_total_movies(self, obj):
        return obj.total_movies
    
    def validate(self, data):
        """Validates duplicate name"""
        name = data.get('name')

        if not self.instance and name:
            existing_actor = Actor.objects.filter(name=name).exclude(id=data.get('id')).exists()

            if existing_actor:
                raise serializers.ValidationError(
                    f"Actor already exists"
                )
        
        return data

class MovieSerializer(serializers.ModelSerializer):

    actors_data = ActorSerializer(source='actors', many=True, read_only=True)
    actors_id = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Actor.objects.all(), write_only=True
    )

    director_data = DirectorSerializer(source='director', read_only=True)
    director = serializers.PrimaryKeyRelatedField(
        queryset=Director.objects.all(), write_only=True
    )

    class Meta:
        model = Movie
        fields = ['id', 'title', 'year', 'genres', 'rating', 'description', 'poster_url', 'created_at', 'updated_at', 'director', 'director_data', 'actors_id', 'actors_data']

        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # actors_ids is not a model field, it's just for serialization. If it is not removed from validated_data, Movie.objects.create() will fail
        actor_ids = validated_data.pop('actors_id', [])

        #  if only the title is sent (or some key info is missing), we fill the rest from TMDB
        required_keys = ["year", "genres", "description", "poster_url", "rating"]
        missing = [key for key in required_keys if key not in validated_data or validated_data.get(key) in [None, '', []]]

        if "title" in validated_data and missing:
            tmdb_data = fetch_movie_data(validated_data["title"])
            validated_data.update({k: v for k, v in tmdb_data.items() if v is not None})
        
        movie = Movie.objects.create(**validated_data)
        
        if actor_ids:
            movie.actors.set(actor_ids)
            
        return movie
    
    def update(self, instance, validated_data):
        actors_ids = validated_data.pop('actors_id', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()

        if actors_ids is not None:
            instance.actors.set(actors_ids)

        return instance
    
    def validate(self, data):
        """Validates duplicate title"""
        title = data.get('title')

        if not self.instance and title:
            existing_movie = Movie.objects.filter(title=title).exclude(id=data.get('id')).exists()

            if existing_movie:
                raise serializers.ValidationError(
                    f"Movie already exists"
                )
        
        return data
    
    def validate_year(self, value):
        current_year = datetime.now().year
        if value < 1888 or value > current_year:
             raise serializers.ValidationError("Year must be between 1888 and the current year.")
        
        return value
    
    def validate_rating(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Rate must be between 1 - 10')

        return value
    
    def validate_created_at(self, value):
        if not self.instance and value:
            raise serializers.ValidationError({'created_at': 'Field is read only'})
        
        return value