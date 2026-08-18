from django.db import models


class Record(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	first_name = models.CharField(max_length=50)
	last_name =  models.CharField(max_length=50)
	email =  models.CharField(max_length=100)
	phone = models.CharField(max_length=15)
	address =  models.CharField(max_length=100)
	city =  models.CharField(max_length=50)
	state =  models.CharField(max_length=50)
	zipcode =  models.CharField(max_length=20)
	description = models.TextField(blank=True, null=True)
	ai_score = models.IntegerField(null=True, blank=True)
	ai_reason = models.CharField(max_length=255, null=True, blank=True)
	ai_scored_at = models.DateTimeField(null=True, blank=True)
	scoring_status = models.CharField(
		max_length=20,
		choices=[('IDLE', 'Idle'), ('PROCESSING', 'Processing')],
		default='IDLE',
	)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return(f"{self.first_name} {self.last_name}")
