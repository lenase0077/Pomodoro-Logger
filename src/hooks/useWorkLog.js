import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'deepwork_logs';

export const useWorkLog = () => {
    const [logs, setLogs] = useState([]);

    // Load logs on mount
    useEffect(() => {
        const savedLogs = localStorage.getItem(STORAGE_KEY);
        if (savedLogs) {
            try {
                setLogs(JSON.parse(savedLogs));
            } catch (e) {
                console.error('Failed to parse logs', e);
                setLogs([]);
            }
        }
    }, []);

    const addLog = useCallback((note, duration, type = 'FOCUS') => {
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            duration, // in seconds
            note,     // The "what did you achieve" text
            type,     // Focus or specific tag
        };

        setLogs((prevLogs) => {
            const updatedLogs = [newLog, ...prevLogs];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
            return updatedLogs;
        });
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /**
     * Get logs grouped by date for the commit graph
     * Returns: { "YYYY-MM-DD": count, ... }
     */
    const getDailyCounts = useCallback(() => {
        return logs.reduce((acc, log) => {
            const date = log.timestamp.split('T')[0];
            acc[date] = (acc[date] || 0) + 1; // Count sessions, or maybe sum duration?
            // For "commit graph", usually count is density.
            // But we could also sum minutes. Let's start with count (sessions).
            return acc;
        }, {});
    }, [logs]);

    /**
     * Get today's logs
     */
    const getTodayLogs = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return logs.filter(log => log.timestamp.startsWith(today));
    }, [logs]);

    return {
        logs,
        addLog,
        clearLogs,
        getDailyCounts,
        getTodayLogs
    };
};
