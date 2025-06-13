export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const minutesFormatted = String(minutes).padStart(2, '0');
    const secondsFormatted = String(remainingSeconds).padStart(2, '0');
    return `${minutesFormatted}:${secondsFormatted}`;
};