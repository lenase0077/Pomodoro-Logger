import { useMemo } from 'react';
import './CommitGraph.css';

export default function CommitGraph({ logs }) {
    // Generate last 365 days
    const calendarData = useMemo(() => {
        const days = [];
        const today = new Date();
        // Start from 52 weeks ago to fill a grid
        const endDate = today;
        const startDate = new Date(today);
        startDate.setDate(endDate.getDate() - 364);

        // Map logs to date strings
        const logCounts = logs.reduce((acc, log) => {
            const date = log.timestamp.split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Iterate
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const count = logCounts[dateStr] || 0;
            days.push({
                date: dateStr,
                count,
                level: Math.min(count, 4) // 0-4 intensity scale
            });
        }
        return days;
    }, [logs]);

    // Group by weeks for the grid layout
    // (We assume a vertical flow for weeks, horizontal for days usually, 
    // but CSS Grid is easier if we just dump them and use columns)
    // Actually, GitHub graph is: Columns = Weeks, Rows = Days (Sun-Sat).
    // Let's stick to a simple flexible grid for mobile responsiveness first.

    return (
        <div className="commit-graph-container">
            <h3>Productivity Graph</h3>
            <div className="graph-grid">
                {calendarData.map((day, i) => (
                    <div
                        key={day.date}
                        className={`day-cell level-${day.level}`}
                        title={`${day.date}: ${day.count} sessions`}
                        // Add a small delay for animation effect
                        style={{ animationDelay: `${i * 2}ms` }}
                    />
                ))}
            </div>
            <div className="graph-legend">
                <span>Less</span>
                <div className="legend-cells">
                    <div className="day-cell level-0"></div>
                    <div className="day-cell level-1"></div>
                    <div className="day-cell level-2"></div>
                    <div className="day-cell level-3"></div>
                    <div className="day-cell level-4"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
