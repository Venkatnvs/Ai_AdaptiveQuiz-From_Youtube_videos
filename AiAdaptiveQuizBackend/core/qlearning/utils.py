from .qtable import QLearningAgent

agent = QLearningAgent()


def get_adaptation_level(user_id, course_id):
    try:
        return agent.avg_level(f"{user_id}:{course_id}")
    except Exception as e:
        print(e)
        return 0.0