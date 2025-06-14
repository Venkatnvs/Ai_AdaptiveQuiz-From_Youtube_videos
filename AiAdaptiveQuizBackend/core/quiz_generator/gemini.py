import os, google.generativeai as genai

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY", "AIzaSyAoBmd8UiGipb9TZ6C4YmDP2EELMGyNeqI"))
MODEL = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

from core.quiz_generator.prompts import QUESTION_PROMPT

def generate_questions(transcript, count=10, difficulty=None):
    prompt = QUESTION_PROMPT.format(transcript=transcript[:3000], count=count, difficulty=difficulty)
    resp = MODEL.generate_content(prompt)
    try:
        return eval(resp.text)
    except:
        return []