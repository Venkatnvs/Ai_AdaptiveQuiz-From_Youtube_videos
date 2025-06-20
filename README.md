# 📚 AI-Driven Adaptive Assessment Platform

This platform offers a personalized learning experience using **AI models**, **Q-learning**, and **Fog Computing**. It dynamically generates quizzes based on user performance and serves them efficiently through edge fog nodes.

---

## 📈 Video


https://github.com/user-attachments/assets/8ee0d05e-c136-4aa6-915c-cccb44bc6ba8

**Youtube Link**: [https://www.youtube.com/watch?v=juHuOA2Kk5g](https://www.youtube.com/watch?v=juHuOA2Kk5g)

---

## 🚀 Features

- 🎥 Extracts learning content from **YouTube videos**
- 🧠 Transcribes video using **Whisper**
- ✍️ Generates contextual quizzes using **Gemini (Google GenAI)**
- 🎯 Adapts difficulty with **Q-learning** (Reinforcement Learning)
- ⚙️ Uses **Fog Computing** for low-latency quiz delivery
- ⭐ Progress tracking, star-based rewards & user dashboards
- 📊 Personalized performance analytics

---

## 🛠️ Tech Stack

| Layer     | Tools Used                           |
|-----------|---------------------------------------|
| Frontend  | React (Vite) + Shadcn UI + Tailwind CSS |
| Backend   | Django REST Framework + JWT Auth      |
| AI Models | Whisper, Gemini (Google GenAI), Q-learning |
| Edge      | Flask Fog Server with local caching   |
| Data      | PostgreSQL (default), JSON-based Q-tables |
| DevOps    | Docker (for Flask), systemd services |

---

## 🧠 Models Used

| Model       | Purpose                    | Accuracy |
|-------------|----------------------------|----------|
| Whisper     | Audio Transcription        | ~90–95% (English, clear audio) |
| Gemini      | MCQ Question Generation    | ~85–92% (context relevance) |
| Q-learning  | Adaptive Difficulty Engine | ~90%+ (convergence accuracy) |

---

## 🔄 System Architecture

This AI-Driven Adaptive Assessment system combines Django (backend), React (frontend), and Flask (fog computing) to create a real-time, personalized quiz experience powered by AI models.

### 🎯 High-Level Flow

1. **User selects a course** → Selects a video to learn.
2. **Video Transcription** → Whisper (OpenAI) transcribes the audio.
3. **Quiz Generation** → Gemini API creates personalized questions based on Q-table difficulty and transcript context.
4. **Adaptive Quiz Delivery** → Questions are served based on user’s Q-learning performance via fog node.
5. **Result Analysis** → Scores, star rewards, progress, and adaptation level are stored and visualized.


## 🧰 Django Backend

![WhatsApp Image 2025-06-14 at 19 14 51_5ccf6242](https://github.com/user-attachments/assets/188dfbf6-60ea-4c20-860b-fe5260defcc5)
![WhatsApp Image 2025-06-14 at 19 15 10_b6f18937](https://github.com/user-attachments/assets/4ba233dc-13ed-4e94-876e-812ff7b4951a)

### 🔧 Setup And Run

```bash
python -m venv env
source env/bin/activate
cd AiAdaptiveQuizBackend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### 🔧 Packages (Django)
- Django + Django REST Framework
- Q-learning (Reinforcement Learning)
- Gemini (Google GenAI) for question generation
- Whisper (OpenAI) for transcription
- JWT Authentication
- Media handling with Pillow
- Documentation with drf-yasg

## ⚛️ React Frontend (Vite + Tailwind)

 ![WhatsApp Image 2025-06-14 at 19 12 45_e64e561f](https://github.com/user-attachments/assets/b5413928-b5b5-4f58-9925-a7c609298cad)
 ![image](https://github.com/user-attachments/assets/9073f6a2-b7b2-4f94-a741-9d1f1d59bc22)
 ![WhatsApp Image 2025-06-14 at 19 13 31_198a9037](https://github.com/user-attachments/assets/5f6e2bfb-e241-4e8f-a550-d79f23dce998)
 ![WhatsApp Image 2025-06-14 at 19 14 09_082cf489](https://github.com/user-attachments/assets/db555b3d-340e-4e7b-90fd-58dc1336fee2)
 ![image](https://github.com/user-attachments/assets/f39c55ff-d445-43c5-9d88-f605b1fb1f58)


### 🔧 Setup And Run
```bash
cd AiQuizFrontend/
npm install
npm run dev
```

### 🔧 Packages
- Vite + React + TypeScript
- Tailwind CSS + ShadCN UI
- Redux Toolkit for state management
- Axios for API requests
- React Router

## 🔁Q Table

![Screenshot 2025-06-16 190524](https://github.com/user-attachments/assets/4ac72814-f0b5-43b0-9294-2b4c8dfc1cfc)


## ☁️ Fog Node (Flask)

### 🔧 Setup And Run
```bash
cd fog_computing/
pip install -r requirements.txt
python app.py
```

- Flask server acting as fog node
- Smart caching & log-based monitoring
- Low-latency API proxy for dashboard st

### ![image](https://github.com/user-attachments/assets/2715620b-a58d-4c54-ac68-638beb495823)


### 🛡️ Endpoints Cached via Fog Node

- /dashboard-info
- /total-stars
- /q-table/overall

## 🧪 How It Works

1. User selects a **Course** and starts a **Video**.
2. On video completion:
   - 🎙️ **Whisper** transcribes audio to text.
   - 🧠 **Gemini** (Google GenAI) generates context-aware questions based on transcript and Q-table difficulty.
   - 📊 **Q-learning engine** selects optimal difficulty level.
   - 🚀 Questions are delivered via **Flask Fog Node** (with caching).
3. 📝 User answers the quiz. Results are saved.
4. 🔁 Q-table is updated based on performance.
5. 📈 Dashboard reflects:
   - Progress per Course
   - Earned Rewards (🌟 Stars)
   - Quiz difficulty adaptation
   - Video-wise performance analytics

 ![image](https://github.com/user-attachments/assets/941b970e-0b19-4ca7-b2fa-c28d1b5c57f1)

---

## 📊 Quiz Analysis & Adaptation

- 🎯 **Q-table is maintained per user per course**.
- 🔍 Each quiz session stores:
  - Difficulty served
  - Correct/wrong answers
  - Adaptation level (average Q-value)
- 📉 **Next questions adjust dynamically**.
- 📊 **Visual analytics**:
  - Course progress
  - Session-wise improvement
  - Difficulty trends

 ![image](https://github.com/user-attachments/assets/f8d0dfb2-ea79-4350-a4e2-ae7eab6e748d)

---

## 📈 Future Enhancements
- 🏅 Gamification with badges and achievements
- 🧩 More Quiz Types: Fill-in-the-blanks, Matching, True/False
- 🤖 AI Suggestions: Personalized topic recommendations
- 🧑‍🤝‍🧑 Peer Learning: Group-based quiz sessions

## 📬 Contact
Made with ❤️ by N. Venkat Swaroop

Email: venkatnvs2005@gmail.com

👉 [GitHub](https://github.com/venkatnvs) | [LinkedIn](https://www.linkedin.com/in/n-venkat-swaroop/)
