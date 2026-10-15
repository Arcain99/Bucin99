import React, { useMemo } from 'react';

export default function FloatingHearts() {
    const hearts = useMemo(() => {
        const icons = ['💖', '💕', '✨', '🌸', '💫', '🧸', '🍓', '💌'];
        return Array.from({ length: 22 }).map((_, i) => ({
            id: i,
            icon: icons[i % icons.length],
            left: `${Math.random() * 95}%`,
            size: `${14 + Math.random() * 22}px`,
            duration: `${9 + Math.random() * 12}s`,
            delay: `${Math.random() * 8}s`,
            opacity: 0.25 + Math.random() * 0.45,
        }));
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {hearts.map((h) => (
                <span
                    key={h.id}
                    className="floating-heart select-none"
                    style={{
                        left: h.left,
                        fontSize: h.size,
                        animationDuration: h.duration,
                        animationDelay: h.delay,
                        opacity: h.opacity,
                    }}
                >
                    {h.icon}
                </span>
            ))}
        </div>
    );
}
