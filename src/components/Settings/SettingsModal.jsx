import { useState, useEffect, useRef } from 'react';
import { Save, Volume2, VolumeX } from 'lucide-react';
import './SettingsModal.css';

export default function SettingsModal({ isOpen, onClose, onSave }) {
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            // We need to check if the click was on the trigger button too (which is in parent).
            // Since we are stopping propagation in App.jsx trigger click, this runs only for other clicks.
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        // Use timeout to avoid immediate close from the opening click if propagation wasn't stopped perfectly
        // But since we use stopPropagation on the trigger, simple listener is okay.
        // Adding slight delay or capturing phase helps sometimes.
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Default values
    const [durations, setDurations] = useState({
        focus: 25,
        short_break: 5,
        long_break: 15
    });
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Load from local storage
    useEffect(() => {
        if (!isOpen) return;
        const saved = localStorage.getItem('deepwork_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.durations) setDurations(parsed.durations);
                if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
            } catch (e) {
                console.error(e);
            }
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const settings = { durations, soundEnabled };
        localStorage.setItem('deepwork_settings', JSON.stringify(settings));
        onSave(settings);
        onClose();
    };

    const handleChange = (mode, val) => {
        setDurations(prev => ({
            ...prev,
            [mode]: parseInt(val) || 0
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="settings-popover" ref={modalRef} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="settings-form-popover">
                <div className="popover-section">
                    <h4>Durations (min)</h4>
                    <div className="inputs-row">
                        <div className="input-tiny">
                            <label>Focus</label>
                            <input type="number" value={durations.focus} onChange={(e) => handleChange('focus', e.target.value)} />
                        </div>
                        <div className="input-tiny">
                            <label>Short</label>
                            <input type="number" value={durations.short_break} onChange={(e) => handleChange('short_break', e.target.value)} />
                        </div>
                        <div className="input-tiny">
                            <label>Long</label>
                            <input type="number" value={durations.long_break} onChange={(e) => handleChange('long_break', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="popover-section checkbox-row">
                    <span>Sound</span>
                    <button
                        type="button"
                        className={`icon-toggle ${soundEnabled ? 'on' : 'off'}`}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title="Toggle Sound"
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                </div>

                <div className="popover-actions">
                    <button type="submit" className="save-btn-small">
                        <Save size={14} /> Save
                    </button>
                </div>
            </form>
        </div>
    );
}
