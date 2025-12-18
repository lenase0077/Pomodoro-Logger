// Sound Utility
// Currently uses Web Audio API for a zero-dependency pleasant chime.
// To replace with a custom audio file:
// 1. Import your file: import notificationSound from '../assets/mysound.mp3';
// 2. Use: new Audio(notificationSound).play();

export const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/bell-notification.mp3');
        audio.play().catch(e => console.warn('Audio play failed', e));
    } catch (error) {
        console.warn("Audio setup failed:", error);
    }
};
