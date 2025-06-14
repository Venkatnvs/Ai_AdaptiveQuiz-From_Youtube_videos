import json
import os
import re
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY", "AIzaSyAoBmd8UiGipb9TZ6C4YmDP2EELMGyNeqI"))
model = "gemini-2.5-flash-preview-05-20"
generate_content_config = types.GenerateContentConfig(
    response_mime_type="application/json",
    temperature=0.5
)

from core.quiz_generator.prompts import QUESTION_PROMPT

def generate_questions(transcript, count=10, difficulty="medium", state=0.0):
    # Remove Markdown code fences if present
    fenceRegex = r"^```(?:json)?\s*\n?(.*?)\n?\s*```$"
    match = re.match(fenceRegex, transcript)
    if match and match[1]:
        transcript = match[1].strip()
    
    # Format the transcript by replacing all whitespace characters with a single space
    transcript = re.sub(r'\s+', ' ', transcript)
    
    prompt = QUESTION_PROMPT.format(
        transcript=transcript,
        count=count,
        difficulty=difficulty,
        state=state
    )

    # Request JSON output explicitly
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=generate_content_config,
    )

    try:
        json_str = resp.text.strip()

        # Match and extract JSON content from code blocks using re.DOTALL
        match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", json_str, re.DOTALL)
        if match:
            json_str = match.group(1).strip()

        # Sanitize invalid characters (like BOM, smart quotes)
        json_str = re.sub(r"[^\x20-\x7E\s]", "", json_str)

        # Parse and return
        return json.loads(json_str)
    except Exception as e:
        raise ValueError("Failed to parse questions from LLM response.")