import os
from django.shortcuts import render

try:
    is_production = bool(os.environ['DJANGO_MODE'])
except KeyError:
    is_production = False


def home(request):
    return render(request, 'index.html', {'production': is_production})


def legacy_home(request):
    is_legacy = 'legacy' in request.path
    return render(request, 'index.html', {'legacy': is_legacy,
                                          'production': is_production})
