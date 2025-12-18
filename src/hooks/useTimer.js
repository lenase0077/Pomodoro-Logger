import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '../utils/sound';

const defaultModes = {
    FOCUS: { id: 'focus', time: 25 * 60, label: 'Deep Work' },
    SHORT_BREAK: { id: 'short_break', time: 5 * 60, label: 'Short Break' },
    LONG_BREAK: { id: 'long_break', time: 15 * 60, label: 'Long Break' },
};

export const useTimer = (initialMode = 'FOCUS') => {
    // State to hold modes, as they can now change via settings
    const [modes, setModes] = useState(defaultModes);
    const [mode, setMode] = useState(modes[initialMode] || modes.FOCUS);
    const [timeLeft, setTimeLeft] = useState(mode.time);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const timerRef = useRef(null);

    // Initial load of settings
    useEffect(() => {
        const saved = localStorage.getItem('deepwork_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.durations) {
                    updateDurations(parsed.durations);
                }
                if (parsed.soundEnabled !== undefined) {
                    setSoundEnabled(parsed.soundEnabled);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const updateDurations = useCallback((newDurations) => {
        setModes(prev => {
            const updated = { ...prev };
            // Map keys
            if (newDurations.focus) updated.FOCUS = { ...updated.FOCUS, time: newDurations.focus * 60 };
            if (newDurations.short_break) updated.SHORT_BREAK = { ...updated.SHORT_BREAK, time: newDurations.short_break * 60 };
            if (newDurations.long_break) updated.LONG_BREAK = { ...updated.LONG_BREAK, time: newDurations.long_break * 60 };

            return updated;
        });

        // Sync with current mode immediately
        // We need to know WHICH mode we are currently in, then grab its NEW time from newDurations
        // But 'mode' state is stale here inside callback? No, 'mode' is dependency or we use ref?
        // Let's use functional update for setMode/setTimeLeft or just check against ID.
        setMode(prevMode => {
            let newTime = null;
            if (prevMode.id === 'focus' && newDurations.focus) newTime = newDurations.focus * 60;
            if (prevMode.id === 'short_break' && newDurations.short_break) newTime = newDurations.short_break * 60;
            if (prevMode.id === 'long_break' && newDurations.long_break) newTime = newDurations.long_break * 60;

            if (newTime !== null) {
                const updatedMode = { ...prevMode, time: newTime };
                // Also update timeLeft if not running to reflect change immediately
                // We use a separate state update for timeLeft because we can't access isRunning here easily without dependency loop?
                // Actually we can just update timeLeft if it equals the OLD time (meaning it was full) OR just force reset it?
                // User expects "Save" -> "Time updates".
                // Let's force update timeLeft to newTime.
                setTimeLeft(newTime);
                return updatedMode;
            }
            return prevMode;
        });

    }, []);

    // Exposed function to update settings from App
    const updateSettings = useCallback((settings) => {
        if (settings.durations) updateDurations(settings.durations);
        if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
    }, [updateDurations]);


    const startTimer = useCallback(() => {
        if (!isRunning && timeLeft > 0) {
            setIsRunning(true);
            setIsCompleted(false);
        }
    }, [isRunning, timeLeft]);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setIsCompleted(false);
        // We find the current mode in potentially updated 'modes' state ensures we get new intial time
        // But 'mode' state itself needs to be refreshed if we just updated settings?
        // Let's just reset to 'mode.time'. If the user updated settings, they likely switched modes or we need to re-select.
        // For simplicity, just reset to current mode logic.
        setTimeLeft(mode.time);
    }, [mode]);

    const switchMode = useCallback((newModeId) => {
        const newMode = Object.values(modes).find(m => m.id === newModeId);
        if (newMode) {
            setMode(newMode);
            setIsRunning(false);
            setIsCompleted(false);
            setTimeLeft(newMode.time);
        }
    }, [modes]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Timer finished
            setIsRunning(false);
            setIsCompleted(true);
            clearInterval(timerRef.current);
            if (soundEnabled) playNotificationSound();
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

    const finishSession = useCallback(() => {
        setIsRunning(false);
        setIsCompleted(true);
        setTimeLeft(0);
        // Note: We generally don't play sound on manual skip, but users might like it.
        // Let's keep it silent on manual skip to avoid annoyance, or uncomment below.
        // playNotificationSound(); 
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const debugFastForward = useCallback(() => {
        setTimeLeft(5);
        setIsRunning(true);
        setIsCompleted(false);
    }, []);

    const progress = 1 - (timeLeft / mode.time);

    return {
        timeLeft,
        isRunning,
        isCompleted,
        mode,
        progress, // 0 to 1
        startTimer,
        pauseTimer,
        resetTimer,
        switchMode,
        formatTime,
        MODES: modes, // Export state modes
        debugFastForward,
        finishSession,
        updateSettings
    };
};
