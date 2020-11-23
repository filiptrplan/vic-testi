from django.db import models

# Create your models here.
class Subject(models.Model):
    """Subject model: only contains name"""
    name = models.CharField(max_length=20)
    def __str__(self):
        return self.name

class Professor(models.Model):
    """Professor model: contains name and the teaching subject"""
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=30)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    def __str__(self):
        return self.first_name + ' ' + self.last_name

class Test(models.Model):
    """Test model: contains year, professor"""
    class Year(models.IntegerChoices):
        """Choices for the Test.year field: goes from year 1 to year 4"""
        YEAR1 = 1
        YEAR2 = 2
        YEAR3 = 3
        YEAR4 = 4
    year = models.IntegerField(choices=Year.choices)
    professor = models.ForeignKey(Professor, on_delete=models.CASCADE)


class TestImage(models.Model):
    """TestImage model: contains the file URL and the test"""
    file = models.URLField()
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='files')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.file