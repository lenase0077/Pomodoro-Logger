import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2 } from 'lucide-react';
import './TransparencyCard.css';

export default function TransparencyCard({ logs, onClose }) {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Calculate stats for the card
    const totalSessions = logs.length;
    const totalMinutes = logs.reduce((acc, log) => acc + (log.duration / 60), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);

    // Get last 3 logs for "Recent Deep Work"
    const recentLogs = logs.slice(0, 3);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null, // Transparent background if possible, or style it
                scale: 2, // High res
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `deep-work-transparency-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to generate image.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="transparency-overlay">
            <div className="transparency-modal">
                <div className="modal-header">
                    <h3>Export Transparency</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="card-preview-container">
                    {/* This is the card that gets screenshot */}
                    <div className="transparency-card" ref={cardRef}>
                        <div className="card-header">
                            <span className="card-logo">⚡ Deep Work</span>
                            <span className="card-date">{new Date().toLocaleDateString()}</span>
                        </div>

                        <div className="card-stats">
                            <div className="stat-item">
                                <span className="stat-value">{totalSessions}</span>
                                <span className="stat-label">Sessions</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{hours}h {mins}m</span>
                                <span className="stat-label">Total Focus</span>
                            </div>
                        </div>

                        <div className="card-divider"></div>

                        <div className="card-recent">
                            <h4>Recent Achievements</h4>
                            {recentLogs.length === 0 ? (
                                <p className="empty-state">No sessions logged yet.</p>
                            ) : (
                                <ul className="recent-list">
                                    {recentLogs.map(log => (
                                        <li key={log.id} className="recent-item">
                                            <span className="check">✓</span> {log.note}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="card-footer">
                            Built with precision.
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="action-btn primary"
                        onClick={handleDownload}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : <><Download size={18} /> Download Image</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
