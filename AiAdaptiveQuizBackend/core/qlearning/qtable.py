import os, pickle, random

class QLearningAgent:
    def __init__(self, actions=None, alpha=0.1, gamma=0.9, epsilon=0.2, storage="q_tables"):
        # Expanded action set
        self.actions = actions or ["very_easy","easy","medium","hard","very_hard"]
        self.alpha, self.gamma, self.epsilon = alpha, gamma, epsilon
        self.storage = storage
        os.makedirs(self.storage, exist_ok=True)
        self.q_tables = {}

    def _path(self, key):
        return os.path.join(self.storage, f"{key}.pkl")

    def load(self, key):
        path = self._path(key)
        if os.path.exists(path):
            with open(path,"rb") as f:
                self.q_tables[key] = pickle.load(f)
        else:
            self.q_tables[key] = {}

    def save(self, key):
        with open(self._path(key),"wb") as f:
            pickle.dump(self.q_tables[key], f)

    def get_q(self, key, state, action):
        return self.q_tables[key].get((state,action), 0.0)

    def choose_action(self, key, state):
        self.load(key)
        table = self.q_tables[key]
        if random.random() < self.epsilon or not table:
            return random.choice(self.actions)
        # pick action with max Q
        qs = [self.get_q(key,state,a) for a in self.actions]
        max_q = max(qs)
        best = [a for a,q in zip(self.actions,qs) if q==max_q]
        return random.choice(best)

    def update(self, key, state, action, reward, next_state):
        self.load(key)
        table = self.q_tables[key]
        max_next = max([self.get_q(key,next_state,a) for a in self.actions], default=0.0)
        old = self.get_q(key,state,action)
        new = old + self.alpha*(reward + self.gamma*max_next - old)
        table[(state,action)] = new
        self.save(key)

    def avg_level(self, key):
        self.load(key)
        vals = list(self.q_tables[key].values())
        return sum(vals)/len(vals) if vals else 0.0
    
    def export_qtable(self, key):
        self.load(key)
        table = self.q_tables.get(key, {})
        return [
            {"state": str(state), "action": action, "q_value": round(q, 4)}
            for (state, action), q in table.items()
        ]