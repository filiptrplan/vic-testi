from django.db import models

# Create your models here.
class Test(models.Model):
    class Year(models.IntegerChoices):
        YEAR1 = 1
        YEAR2 = 2
        YEAR3 = 3
        YEAR4 = 4
    year = models.IntegerField(choices=Year.choices)
    professor = models.ForeignKey(Professor, on_delete=models.CASCADE)

class Professor(models.Model):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=30)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

class Subject(models.Model):
    name = models.CharField(max_length=20)

class TestImage(models.Model):
    file = models.FileField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='files')