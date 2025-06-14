from .qtable import QLearningAgent

agent = QLearningAgent()


def get_adaptation_level(user_id, course_id):
    try:
        return agent.avg_level(f"{user_id}_{course_id}")
    except Exception as e:
        print(e)
        return 0.0
    
def get_ai_level(level):
    if level < 0.05:
        return "Beginner"
    elif level < 0.15:
        return "Intermediate"
    elif level < 0.25:
        return "Advanced"
    else:
        return "Expert"