import os
from django.shortcuts import render

try:
    is_production = bool(os.environ['DJANGO_MODE'])
except KeyError:
    is_production = False


def dashboard(request):
    return render(request, 'dashboard.html', {'production': is_production})
