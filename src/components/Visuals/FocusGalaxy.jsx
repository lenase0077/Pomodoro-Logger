import { useEffect, useRef, useState } from 'react';
import './FocusGalaxy.css';

export default function FocusGalaxy({ logs }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const particlesRef = useRef([]);
    // Ref for mouse position relative to canvas
    const mouseRef = useRef({ x: null, y: null });
    // Ref for the currently dragged particle
    const draggedParticleRef = useRef(null);

    const [hoveredLog, setHoveredLog] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const connectionDistance = 120;

        const initParticles = () => {
            if (!containerRef.current) return;
            // Note: We only re-init if logs change length/content significantly.
            // But for now, simple re-init is fine.

            const width = canvas.width = containerRef.current.clientWidth;
            const height = canvas.height = 300;

            const logParticles = logs.map((log) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 3 + 4, // Slightly bigger
                color: 'hsla(260, 100%, 75%, 0.9)',
                glow: 'hsla(260, 100%, 65%, 0.5)',
                logData: log,
                isDragging: false
            }));

            // Reduced ambient stars to avoid confusion, or make them very distinct
            // If user has NO logs, show some ambient. If they have logs, show fewer/none?
            // User confused ambient stars with tasks. Let's make ambient stars purely background and smaller.
            const ambientCount = Math.max(0, 30 - logParticles.length);
            const ambientParticles = Array.from({ length: ambientCount }).map(() => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                size: Math.random() * 1.5,
                color: 'hsla(220, 20%, 70%, 0.15)', // Very faint
                glow: null,
                logData: null,
                isDragging: false
            }));

            particlesRef.current = [...logParticles, ...ambientParticles];
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            // Draw Connections (Background)
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                if (p1.isDragging) {
                    // If dragging, position tracks mouse EXACTLY
                    // We use a smooth approach or direct? Direct feels more responsive for "grabbing".
                    if (mouse.x !== null && mouse.y !== null) {
                        p1.x = mouse.x;
                        p1.y = mouse.y;
                        p1.vx = 0; // Stop momentum while dragging
                        p1.vy = 0;
                    }
                } else {
                    // Normal Movement
                    p1.x += p1.vx;
                    p1.y += p1.vy;

                    // Bounce
                    if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
                    if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;
                }

                // Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = 1 - (dist / connectionDistance);
                        ctx.strokeStyle = `hsla(260, 50%, 60%, ${opacity * 0.4})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw Stars
            particles.forEach(p => {
                ctx.beginPath();
                // If dragging, maybe slightly bigger?
                const r = p.isDragging ? p.size * 1.2 : p.size;
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;

                if (p.glow) {
                    ctx.shadowBlur = p.isDragging ? 20 : 10;
                    ctx.shadowColor = p.glow;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        const handleResize = () => initParticles();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [logs]);

    // UPDATE MOUSE POS
    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseRef.current = { x, y };

        // Drag Logic
        if (draggedParticleRef.current) {
            // If dragging, we don't look for hover
            canvasRef.current.style.cursor = 'grabbing';
            setHoveredLog(null); // Hide tooltip while dragging
            return;
        }

        // Hover Logic (Only if not dragging)
        let found = null;
        for (const p of particlesRef.current) {
            if (!p.logData) continue;
            const dx = x - p.x;
            const dy = y - p.y;
            if (dx * dx + dy * dy < 20 * 20) { // 20px radius
                found = p;
                break;
            }
        }

        if (found) {
            setHoveredLog(found.logData);
            setTooltipPos({ x: found.x, y: found.y });
            canvasRef.current.style.cursor = 'grab';
        } else {
            setHoveredLog(null);
            canvasRef.current.style.cursor = 'default';
        }
    };

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked particle
        for (const p of particlesRef.current) {
            if (!p.logData) continue; // Only interactive ones
            const dx = x - p.x;
            const dy = y - p.y;
            if (dx * dx + dy * dy < 20 * 20) {
                p.isDragging = true;
                draggedParticleRef.current = p;
                canvasRef.current.style.cursor = 'grabbing';
                break;
            }
        }
    };

    const handleMouseUp = () => {
        if (draggedParticleRef.current) {
            draggedParticleRef.current.isDragging = false;
            draggedParticleRef.current = null;
            canvasRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        mouseRef.current = { x: null, y: null };
        handleMouseUp(); // Release drag if leaving canvas
        setHoveredLog(null);
    };

    return (
        <div className="galaxy-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="galaxy-canvas"
            />

            {!hoveredLog && (
                <div className="galaxy-info">
                    <h3>Focus Galaxy</h3>
                    <p>{logs.length} Stars • Drag to Rearrange</p>
                </div>
            )}

            {hoveredLog && !draggedParticleRef.current && (
                <div
                    className="galaxy-tooltip"
                    style={{
                        top: tooltipPos.y,
                        left: tooltipPos.x,
                    }}
                >
                    <div className="tooltip-date">
                        {new Date(hoveredLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="tooltip-note">
                        "{hoveredLog.note}"
                    </div>
                </div>
            )}
        </div>
    );
}
