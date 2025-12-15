from django.urls import path
from .views import MovieListCreateView, MovieDetailView, DirectorListCreateView, DirectorDetailView, ActorListCreateView, ActorDetailView

urlpatterns = [
    path('movies/', MovieListCreateView.as_view(), name='movies'),
    path('movies/<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
    path('directors/', DirectorListCreateView.as_view(), name='directors'),
    path('directors/<int:pk>/', DirectorDetailView.as_view(), name='director-detail'),
    path('actors/', ActorListCreateView.as_view(), name='actors'),
    path('actors/<int:pk>/', ActorDetailView.as_view(), name='actor-detail')
]