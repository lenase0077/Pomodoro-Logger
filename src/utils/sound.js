// Sound Utility
// Currently uses Web Audio API for a zero-dependency pleasant chime.
// To replace with a custom audio file:
// 1. Import your file: import notificationSound from '../assets/mysound.mp3';
// 2. Use: new Audio(notificationSound).play();

export const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Configuration for a "Zen Gong" style sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 (440Hz)
        // Drop pitch slightly for effect
        oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.5);

        // Envelope (Fade out)
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1.5);
    } catch (error) {
        console.warn("Audio playback failed:", error);
    }
};
