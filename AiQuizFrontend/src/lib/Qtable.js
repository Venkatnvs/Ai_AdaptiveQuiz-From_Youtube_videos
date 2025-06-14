export const get_ai_level = (level) => {
    if (level < 0.05) { 
        return "Beginner"
    } else if (level < 0.15) {
        return "Intermediate"
    } else if (level < 0.25) {
        return "Advanced"
    } else {
        return "Expert"
    }
}