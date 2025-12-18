import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import './Logger.css';

export default function Logger({ onLog, onCancel }) {
    const [note, setNote] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (note.trim()) {
            onLog(note);
            setNote('');
        }
    };

    return (
        <div className="logger-overlay">
            <div className="logger-card">
                <div className="logger-header">
                    <h2>Session Complete! <span className="emoji">🎉</span></h2>
                    <button className="close-btn" onClick={onCancel} aria-label="Skip logging">
                        <X size={20} />
                    </button>
                </div>

                <p className="logger-prompt">What did you accomplish during this session?</p>

                <form onSubmit={handleSubmit} className="logger-form">
                    <textarea
                        ref={inputRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="I finished the API integration for..."
                        rows={3}
                        className="logger-input"
                    />
                    <button type="submit" className="logger-submit" disabled={!note.trim()}>
                        Log Achievement <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
