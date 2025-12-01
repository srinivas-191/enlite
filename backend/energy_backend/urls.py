from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Backend is running!")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("energy_api.urls")),
    path("", home),  # <-- this handles the root URL
]
