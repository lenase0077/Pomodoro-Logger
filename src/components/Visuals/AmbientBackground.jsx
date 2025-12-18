import { useEffect, useRef } from 'react';
import './AmbientBackground.css';

export default function AmbientBackground({ mode }) {
    // Mode will be 'focus', 'short_break', or 'long_break'
    // changing the class on the container will trigger CSS transitions

    return (
        <div className={`ambient-bg-container mode-${mode}`}>
            <div className="aurora-orb orb-1"></div>
            <div className="aurora-orb orb-2"></div>
            <div className="aurora-orb orb-3"></div>
            <div className="noise-overlay"></div>
        </div>
    );
}
