export const get_ai_level = (level) => {
    if (level < 0.2) { 
        return "Beginner"
    } else if (level < 0.4) {
        return "Intermediate"
    } else if (level < 0.6) {
        return "Advanced"
    } else {
        return "Expert"
    }
}