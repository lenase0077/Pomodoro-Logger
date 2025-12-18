import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import './Timer.css';

export default function Timer({
    timerState,
    onStart,
    onPause,
    onReset,
    onSwitchMode
}) {
    const { timeLeft, isRunning, mode, progress, formatTime, MODES, finishSession } = timerState;

    // Calculate Dash Offset for SVG Circle
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="timer-container">
            <div className="mode-selector">
                <div
                    className="selector-bg"
                    style={{
                        transform: `translateX(${Object.keys(MODES).findIndex(k => MODES[k].id === mode.id) * 100}%)`,
                    }}
                />
                {Object.values(MODES).map((m) => (
                    <button
                        key={m.id}
                        className={`mode-btn ${mode.id === m.id ? 'active' : ''}`}
                        onClick={() => onSwitchMode(m.id)}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="timer-display">
                <svg className="timer-ringable" width="300" height="300">
                    <circle
                        className="ring-bg"
                        stroke="var(--color-surface-hover)"
                        strokeWidth="12"
                        fill="transparent"
                        r={radius}
                        cx="150"
                        cy="150"
                    />
                    <circle
                        className="ring-progress"
                        stroke="var(--color-primary)"
                        strokeWidth="12"
                        fill="transparent"
                        r={radius}
                        cx="150"
                        cy="150"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="timer-text">
                    <div className="time">{formatTime(timeLeft)}</div>
                    <div className="status">{isRunning ? 'Focusing...' : 'Ready'}</div>
                </div>
            </div>

            <div className="timer-controls">
                {isRunning && (
                    <button className="control-btn secondary" onClick={timerState.finishSession} title="Finish Early">
                        <SkipForward size={20} />
                    </button>
                )}

                {!isRunning ? (
                    <button className="control-btn primary" onClick={onStart}>
                        <Play size={24} fill="currentColor" />
                    </button>
                ) : (
                    <button className="control-btn" onClick={onPause}>
                        <Pause size={24} fill="currentColor" />
                    </button>
                )}
                <button className="control-btn secondary" onClick={onReset}>
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
}
