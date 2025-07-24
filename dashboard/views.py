from django.shortcuts import render


# Create your views here.
def index(request):
    context = {}
    total_passenger = 897
    context["total_passenger"] = total_passenger
    return render(request, "dashboard/index.html", context=context)
