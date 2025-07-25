from django.shortcuts import render
import pandas as pd
from dashboard.models import TitanicPassenger


# Create your views here.
def index(request):
    context = {}
    df = pd.read_csv("static/data/titanic.csv")

    total_passenger = TitanicPassenger.objects.count()
    context["total_passenger"] = total_passenger

    total_male = TitanicPassenger.objects.filter(sex="male").count()
    context["total_male"] = total_male
    context["total_female"] = total_passenger - total_male

    total_fare = sum(TitanicPassenger.objects.values_list("fare", flat=True))
    context["total_fare"] = "$ " + str(int(total_fare // 1000)) + "K"

    total_survived = df[df["Survived"] == 1].shape[0]
    context["total_survived"] = total_survived
    context["survived_rate"] = round(total_survived / total_passenger * 100, 2)

    classes = sorted(df["Pclass"].unique().tolist())
    context["classes"] = classes

    count_by_class = list(df["Pclass"].value_counts().loc[classes])
    context["count_by_class"] = count_by_class

    survived_by_class = df.groupby("Pclass")["Survived"].sum().loc[classes].tolist()
    context["survived_by_class"] = survived_by_class

    df["Died"] = df["Survived"].map(lambda x: abs(x - 1))
    died_by_class = df.groupby("Pclass")["Died"].sum().loc[classes].tolist()
    context["died_by_class"] = died_by_class

    top_10_fares = df.nlargest(10, "Fare")[["Name", "Fare"]].to_dict(orient="records")
    context["top_10_fares"] = top_10_fares

    df.dropna(subset=["Embarked"], inplace=True)
    df = df[df["Survived"] == 1]
    embarked_by_class = df.groupby(["Embarked", "Pclass"]).size().unstack(fill_value=0)

    ports = embarked_by_class.index.tolist()
    context["ports"] = ports

    embarked_by_class = embarked_by_class.loc[ports, classes].values.tolist()[::-1]

    context["embarked_by_class"] = embarked_by_class

    return render(request, "dashboard/index.html", context=context)
