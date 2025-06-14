import os
import tempfile
import whisper
import subprocess


def download_audio_from_youtube(url):
    """Download audio from a YouTube video and return the file path."""
    if "youtube.com" not in url and "youtu.be" not in url:
        raise ValueError("Only YouTube URLs are supported for transcript generation.")
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "audio.mp3")
    try:
        result = subprocess.run([
            "yt-dlp", "-f", "bestaudio", "--extract-audio", "--audio-format", "mp3",
            "-o", audio_path, url
        ], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"yt-dlp error: {result.stderr}")
            return None
        return audio_path
    except Exception as e:
        print(f"Failed to download audio for {url}: {e}")
        return None


def generate_transcript_from_url(url):
    """Download audio from a video URL and generate transcript using Whisper."""
    try:
        print(f"Attempting to download audio from: {url}")
        audio_path = download_audio_from_youtube(url)
        if not audio_path:
            return ""
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        transcript = result["text"]
        os.remove(audio_path)
        return transcript
    except Exception as e:
        print(f"Error for URL {url}: {e}")
        return "Failed to generate transcript"