from django.contrib import admin
from .models import Category, Course, Video, QuizSession, Question

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'image']
    search_fields = ['name']
    list_filter = ['name']
    list_per_page = 10
    readonly_fields = ['created_at', 'updated_at']

class VideoInline(admin.TabularInline):
    model = Video
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'description', 'category']
    
    # show the Video also in the list
    inlines = [VideoInline]
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    def is_transcript_generated(self, obj):
        return obj.transcript is not None and obj.transcript != ""
    is_transcript_generated.boolean = True
    list_display = ['title', 'video_url', 'course', 'is_transcript_generated']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'score', 'stars']
    readonly_fields = ['created_at', 'updated_at', 'started_at']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'options', 'correct_answer', 'difficulty']
    readonly_fields = ['created_at', 'updated_at']

