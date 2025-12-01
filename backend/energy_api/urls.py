from django.urls import path
from .views import get_building_types, get_defaults, predict_energy

urlpatterns = [
    path("building-types/", get_building_types),
    path("defaults/", get_defaults),
    path("predict/", predict_energy),
]
