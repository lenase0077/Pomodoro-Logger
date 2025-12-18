import { useState, useEffect, useCallback, useRef } from 'react';

const MODES = {
    FOCUS: { id: 'focus', time: 25 * 60, label: 'Deep Work' },
    SHORT_BREAK: { id: 'short_break', time: 5 * 60, label: 'Short Break' },
    LONG_BREAK: { id: 'long_break', time: 15 * 60, label: 'Long Break' },
};

export const useTimer = (initialMode = 'FOCUS') => {
    const [mode, setMode] = useState(MODES[initialMode] || MODES.FOCUS);
    const [timeLeft, setTimeLeft] = useState(mode.time);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const timerRef = useRef(null);

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
        setTimeLeft(mode.time);
    }, [mode]);

    const switchMode = useCallback((newModeId) => {
        const newMode = Object.values(MODES).find(m => m.id === newModeId);
        if (newMode) {
            setMode(newMode);
            setIsRunning(false);
            setIsCompleted(false);
            setTimeLeft(newMode.time);
        }
    }, []);

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

            // Optional: Play sound or notification here
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

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
        MODES,
        debugFastForward
    };
};
