import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check system preference on mount
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = async (e) => {
        // If browser doesn't support View Transitions, just toggle
        if (!document.startViewTransition) {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
            return;
        }

        // Get click coordinates
        const x = e.clientX;
        const y = e.clientY;

        // Calculate radius to furthest corner
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // Start transition
        const transition = document.startViewTransition(() => {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
        });

        // Wait for pseudo-elements to be created
        await transition.ready;

        // Animate the circle
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ],
            },
            {
                duration: 400, // Faster (was 500)
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Snappy yet smooth
                // New view (the incoming theme) grows on top
                pseudoElement: '::view-transition-new(root)',
            }
        );
    };

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="logo">
                    <span className="logo-icon">⚡</span>
                    <h1>Deep Work</h1>
                </div>
                <button onClick={(e) => toggleTheme(e)} className="theme-toggle" aria-label="Toggle theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </header>
            <main className="app-content">
                {children}
            </main>
        </div>
    );
}
