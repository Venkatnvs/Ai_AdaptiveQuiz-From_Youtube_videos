QUESTION_PROMPT = """
You are an AI tutor. Generate {count} MCQs with {difficulty} difficulty with:
- 4 options (a–d)
- correct answer
- difficulty (very_easy, easy, medium, hard, very_hard)
Based on this transcript:
\"\"\"{transcript}\"\"\"
Respond as JSON list.
"""