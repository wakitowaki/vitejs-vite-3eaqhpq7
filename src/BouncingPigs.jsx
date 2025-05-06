import { useEffect, useRef } from "react";

const NUM_PIGS = 10;

const getRandom = (min, max) => Math.random() * (max - min) + min;

export default function BouncingPigs() {
    const containerRef = useRef(null);
    const pigsRef = useRef([]);

    useEffect(() => {
        const pigs = [];

        for (let i = 0; i < NUM_PIGS; i++) {
            pigs.push({
                x: getRandom(0, window.innerWidth - 40),
                y: getRandom(0, window.innerHeight - 40),
                dx: getRandom(-1.5, 1.5),
                dy: getRandom(-1.5, 1.5),
                size: getRandom(24, 40)
            });
        }

        pigsRef.current = pigs;

        const animate = () => {
            const nodes = containerRef.current?.children;
            if (!nodes) return;

            pigsRef.current.forEach((pig, i) => {
                pig.x += pig.dx;
                pig.y += pig.dy;

                if (pig.x <= 0 || pig.x >= window.innerWidth - pig.size) pig.dx *= -1;
                if (pig.y <= 0 || pig.y >= window.innerHeight - pig.size) pig.dy *= -1;

                const node = nodes[i];
                if (node) {
                    node.style.transform = `translate(${pig.x}px, ${pig.y}px)`;
                }
            });

            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1, // 👈 forza di andare dietro a tutto
                pointerEvents: "none",
                overflow: "hidden"
            }}
        >
            {Array.from({ length: NUM_PIGS }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        fontSize: `${getRandom(24, 40)}px`,
                        transition: "transform 0.1s linear"
                    }}
                >
                    🐷
                </div>
            ))}
        </div>
    );
}
