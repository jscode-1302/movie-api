from rest_framework import generics
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from .models import Movie, Director, Actor
from .serializers import MovieSerializer, DirectorSerializer, ActorSerializer
from .filters import MovieFilter

class MovieListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list movies and only authenticated users to create, update and delete"""
    serializer_class = MovieSerializer
    queryset = Movie.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = MovieFilter
    search_fields = ['title', 'description', 'year', 'director__name', 'actors__name']

    @method_decorator(cache_page(60 * 5, key_prefix='movies_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        cache.clear()
        super().perform_create(serializer)

class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see movie details and only authenticated users to update and delete"""
    serializer_class = MovieSerializer
    queryset = Movie.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        cache.clear()
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        cache.clear()
        super().perform_destroy(instance)

class DirectorListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list directors and only authenticated users to create"""
    serializer_class = DirectorSerializer
    queryset = Director.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class DirectorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see director details and only authenticated users to update and delete"""
    serializer_class = DirectorSerializer
    queryset = Director.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

@extend_schema(
    request=ActorSerializer,
    responses=ActorSerializer
)
class ActorListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list actors and only authenticated users to create"""
    serializer_class = ActorSerializer
    queryset = Actor.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ActorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see actor details and only authenticated user to update and delete"""
    serializer_class = ActorSerializer
    queryset = Actor.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]