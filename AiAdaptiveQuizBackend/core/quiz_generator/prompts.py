QUESTION_PROMPT = """
Based on the following transcript of a YouTube video, generate {count} multiple-choice quiz questions using the Q-Table learning model. The difficulty level should be '{difficulty}' and the current state is '{state}'.

Each question must:
- Have exactly 4 unique string options.
- Use the 'correct_answer' as the string index of the correct option: "1", "2", "3", or "4".
- Be categorized as either "easy", "medium", or "hard".

⚠️ Output must be a JSON array of exactly 10 objects. Each object should have:

- "text": string (The question)
- "options": array of 4 strings
- "correct_answer": string ("1", "2", "3", or "4")
- "difficulty": string ("easy", "medium", or "hard")

Return only valid JSON — no comments, no explanations, no markdown, no sample, just the raw JSON array.

Transcript:
{transcript}
"""