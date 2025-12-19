import { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import './DonationMenu.css';

export default function DonationMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className="donation-menu-container" ref={menuRef}>
            <button
                className={`donation-button ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Donations"
                title="Support me"
            >
                <Heart size={20} />
            </button>

            {isOpen && (
                <div className="donation-dropdown">
                    <div className="donation-item">
                        <span className="donation-label">🇦🇷 Argentina</span>
                        <a href='https://cafecito.app/linceros' rel='noopener' target='_blank' className="cafecito-link">
                            <span className="cafecito-icon">☕</span>
                            <span>Invitame un Cafecito</span>
                        </a>
                    </div>
                    <div className="donation-separator"></div>
                    <div className="donation-item">
                        <span className="donation-label">🌎 International</span>
                        <a href='https://ko-fi.com/M4M8TYFD9' target='_blank' rel='noopener' className="kofi-button">
                            <span className="kofi-icon">☕</span>
                            <span>Support me on Ko-fi</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
