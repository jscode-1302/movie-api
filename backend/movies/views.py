import logging
from rest_framework import generics
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from .models import Movie, Director, Actor
from .serializers import MovieSerializer, DirectorSerializer, ActorSerializer
from .filters import MovieFilter

logger = logging.getLogger(__name__)

class MovieListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list movies and only authenticated users to create, update and delete"""
    serializer_class = MovieSerializer
    queryset = Movie.objects.select_related('director').prefetch_related('actors').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_class = MovieFilter
    search_fields = ['title', 'description', 'year', 'director__name', 'actors__name']

    # Temporarily disabled cache to debug 500 error
    # @method_decorator(cache_page(60 * 5, key_prefix='movies_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        cache.clear()
        logger.debug('Cache cleared after movie creation')
        movie = serializer.save()
        logger.info(f"Movie created: '{movie.title}' by user [{self.request.user}]")

class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see movie details and only authenticated users to update and delete"""
    serializer_class = MovieSerializer
    queryset = Movie.objects.select_related('director').prefetch_related('actors').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        cache.clear()
        super().perform_update(serializer)
        logger.info(f"Movie updated: '{serializer.instance.title}' by user [{self.request.user}]")

    def perform_destroy(self, instance):
        cache.clear()
        super().perform_destroy(instance)
        logger.info(f"Movie deleted: '{instance.title}' by {self.request.user}")

class DirectorListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list directors and only authenticated users to create"""
    serializer_class = DirectorSerializer
    queryset = Director.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        director = serializer.save()
        logger.info(f"Director created: '{director.name}' by user [{self.request.user}]")

class DirectorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see director details and only authenticated users to update and delete"""
    serializer_class = DirectorSerializer
    queryset = Director.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        logger.info(f"Director deleted: '{instance.name}' by {self.request.user}")

    def perform_update(self, serializer):
        super().perform_update(serializer)
        logger.info(f"Director updated: '{serializer.instance.name}' by {self.request.user}")

@extend_schema(
    request=ActorSerializer,
    responses=ActorSerializer
)
class ActorListCreateView(generics.ListCreateAPIView):
    """Allows anyone to list actors and only authenticated users to create"""
    serializer_class = ActorSerializer
    queryset = Actor.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        actor = serializer.save()
        logger.info(f"Actor created: '{actor.name}' by user [{self.request.user}]")

class ActorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows anyone to see actor details and only authenticated user to update and delete"""
    serializer_class = ActorSerializer
    queryset = Actor.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        logger.info(f"Actor deleted: '{instance.name}' by {self.request.user}")

    def perform_update(self, serializer):
        super().perform_update(serializer)
        logger.info(f"Actor updated: '{serializer.instance.name}' by {self.request.user}")