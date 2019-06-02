from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('legacy/', views.legacy_home, name='legacy_home')
]
