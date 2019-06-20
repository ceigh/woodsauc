from django.urls import path
from django.views.generic.base import RedirectView

from . import views

urlpatterns = [
    path('', RedirectView.as_view(url='dashboard/', permanent=False), name='index'),
    path('dashboard/', views.dashboard, name='dashboard')
]
