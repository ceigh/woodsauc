from django.shortcuts import render


def home(request):
    return render(request, 'index.html')


def legacy_home(request):
    is_legacy = 'legacy' in request.path
    return render(request, 'index.html', {'legacy': is_legacy})
