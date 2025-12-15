from django_filters import rest_framework as filters
from .models import Movie

class MovieFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr='icontains')
    genres = filters.CharFilter(method='filter_genres')

    class Meta:
        model = Movie
        fields = ['title', 'genres', 'year', 'rating']

    def filter_genres(self, queryset, name, value):
        return queryset.filter(genres__icontains=value)