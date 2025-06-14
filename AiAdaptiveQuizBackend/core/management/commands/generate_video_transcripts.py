from django.core.management.base import BaseCommand
from core.models import Video
from core.quiz_generator.whisper_transcript import generate_transcript_from_url

class Command(BaseCommand):
    help = "Generate transcripts for existing videos without a transcript"

    def handle(self, *args, **options):
        videos = Video.objects.filter(transcript__exact="") | Video.objects.filter(transcript__exact="Failed to generate transcript")
        self.stdout.write(f"Found {videos.count()} videos without transcripts.")
        for video in videos:
            self.stdout.write(f"Processing: {video.title} ({video.video_url})")
            transcript = generate_transcript_from_url(video.video_url)
            video.transcript = transcript
            video.save()
            self.stdout.write(self.style.SUCCESS(f"Transcript saved for: {video.title}")) 