from rest_framework import serializers
from .models import Category, Course, Video, QuizSession, Question

class QuestionSerializer(serializers.ModelSerializer):
    is_correct = serializers.ReadOnlyField()
    class Meta:
        model = Question
        fields = "__all__"
        
class QuestionSerializer2(serializers.ModelSerializer):
    is_correct = serializers.ReadOnlyField()
    class Meta:
        model = Question
        fields = ["id", "session", "text", "options", "correct_answer", "selected", "difficulty", "is_correct"]
        

class QuizSessionSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSession
        fields = ["id", "status", "score", "stars", "adaptation_level", "is_quiz_generated", "is_quiz_submitted", "completed_at"]

class QuizSessionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer2(many=True, read_only=True)
    status = serializers.ReadOnlyField()
    is_quiz_submitted = serializers.ReadOnlyField()
    score = serializers.ReadOnlyField()
    stars = serializers.ReadOnlyField()
    completed_at = serializers.ReadOnlyField()
    
    class Meta:
        model = QuizSession
        fields = "__all__"

class VideoSerializer(serializers.ModelSerializer):
    is_transcript_generated = serializers.ReadOnlyField()
    is_video_started = serializers.SerializerMethodField()
    is_video_completed = serializers.SerializerMethodField()
    
    def get_is_video_started(self, obj):
        user = self.context["request"].user
        return obj.is_video_started_by_user(user)
    
    def get_is_video_completed(self, obj):
        user = self.context["request"].user
        return obj.is_video_completed_by_user(user)
    
    class Meta:
        model = Video
        fields = ["id", "title", "video_url", "is_transcript_generated", "course", "created_at", "updated_at", "is_video_started", "is_video_completed"]

class CourseSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    is_course_started = serializers.SerializerMethodField()
    is_course_completed = serializers.SerializerMethodField()
    total_videos = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = "__all__"
    
    def get_progress(self, obj):
        user = self.context["request"].user
        return obj.progress_percentage(user)
    
    def get_is_course_started(self, obj):
        user = self.context["request"].user
        return obj.is_course_started_by_user(user)
    
    def get_is_course_completed(self, obj):
        user = self.context["request"].user
        return obj.is_course_completed_by_user(user)
    
class CourseDetailSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    is_course_started = serializers.SerializerMethodField()
    is_course_completed = serializers.SerializerMethodField()
    total_videos = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = "__all__"
    
    def get_progress(self, obj):
        user = self.context["request"].user
        return obj.progress_percentage(user)
    
    def get_is_course_started(self, obj):
        user = self.context["request"].user
        return obj.is_course_started_by_user(user)
    
    def get_is_course_completed(self, obj):
        user = self.context["request"].user
        return obj.is_course_completed_by_user(user)
        
class CategorySerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = "__all__"
