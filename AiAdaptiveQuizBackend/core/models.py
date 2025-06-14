from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ActiveModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True

class Category(ActiveModel):
    name = models.CharField(max_length=100, unique=True, help_text="The name of the category")
    image = models.URLField(null=True, blank=True, help_text="The image url of the category")

    def __str__(self):
        return self.name

class Course(ActiveModel):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="courses")
    title = models.CharField(max_length=200, unique=True, help_text="The title of the course")
    description = models.TextField(help_text="The description of the course")
    
    @property
    def total_videos(self):
        return self.videos.count()

    def is_course_started_by_user(self, user):
        return QuizSession.objects.filter(video__course=self, user=user).exists()
    
    def progress_percentage(self, user):
        total_videos = self.total_videos
        if total_videos == 0:
            return 0
        completed_videos = self.videos.filter(quizsession__user=user, quizsession__completed_at__isnull=False).distinct().count()
        return float(completed_videos / total_videos)
    
    def is_course_completed_by_user(self, user):
        return self.progress_percentage(user) == 1

    def __str__(self):
        return self.title

class Video(ActiveModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=200, unique=True, help_text="The title of the video")
    video_url = models.URLField(help_text="The url of the video")
    transcript = models.TextField(blank=True, help_text="The transcript of the video")

    @property
    def is_transcript_generated(self):
        return self.transcript is not None and self.transcript != "" and self.transcript != "Failed to generate transcript"
    
    def is_video_started_by_user(self, user):
        return QuizSession.objects.filter(video=self, user=user).exists()
    
    def is_video_completed_by_user(self, user):
        return self.is_video_started_by_user(user) and QuizSession.objects.filter(video=self, user=user, completed_at__isnull=False).exists()
    
    def save(self, *args, **kwargs):
        if not self.is_transcript_generated and self.video_url:
            from core.quiz_generator.whisper_transcript import generate_transcript_from_url
            import threading
            
            def generate_transcript_async():
                transcript = generate_transcript_from_url(self.video_url)
                if transcript:
                    self.transcript = transcript
                    self.save(update_fields=['transcript'])
            
            thread = threading.Thread(target=generate_transcript_async)
            thread.daemon = True
            thread.start()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class QuizSession(ActiveModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True, help_text="The date and time the quiz session started")
    completed_at = models.DateTimeField(null=True, blank=True, help_text="The date and time the quiz session completed")
    is_quiz_generated = models.BooleanField(default=False, help_text="Whether the quiz is generated")
    is_quiz_submitted = models.BooleanField(default=False, help_text="Whether the quiz is submitted")
    score = models.IntegerField(default=0, help_text="The score of the quiz session")
    stars = models.IntegerField(default=0, help_text="The stars of the quiz session")
    adaptation_level = models.FloatField(default=0.0)  # e.g. average Q-value

    @property
    def status(self):
        return "completed" if self.completed_at else "in_progress"

class Question(ActiveModel):
    session = models.ForeignKey(QuizSession, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField(help_text="The text of the question")
    options = models.JSONField(help_text="The options of the question")
    correct_answer = models.CharField(max_length=1, help_text="The correct answer of the question")
    selected = models.CharField(max_length=1, blank=True, help_text="The selected answer of the question")
    difficulty = models.CharField(max_length=20, help_text="The difficulty of the question")

    @property
    def is_correct(self):
        return self.selected == self.correct_answer