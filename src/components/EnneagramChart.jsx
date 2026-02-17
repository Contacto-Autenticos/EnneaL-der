import React from 'react';

const EnneagramChart = ({ scores }) => {
    // Config
    const size = 300;
    const center = size / 2;
    const radius = 90; // Chart radius
    const outerRadius = 135; // Ring outer radius

    // Enneatype order starting from top (9) clockwise
    const types = [9, 1, 2, 3, 4, 5, 6, 7, 8];

    // Gradients Defs
    const gradients = (
        <defs>
            <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e15241" />
                <stop offset="50%" stopColor="#c13221" />
                <stop offset="100%" stopColor="#a11201" />
            </linearGradient>
            <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4db052" />
                <stop offset="50%" stopColor="#2d9032" />
                <stop offset="100%" stopColor="#0d7012" />
            </linearGradient>
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3ea8ce" />
                <stop offset="50%" stopColor="#1e88ae" />
                <stop offset="100%" stopColor="#00688e" />
            </linearGradient>
            <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ddbe3d" />
                <stop offset="50%" stopColor="#ffe680" />
                <stop offset="100%" stopColor="#bfa01f" />
            </linearGradient>
        </defs>
    );

    // Colors per type group using headers for ring
    const getSegmentFill = (type) => {
        if ([8, 9, 1].includes(type)) return "url(#grad-red)";
        if ([2, 3, 4].includes(type)) return "url(#grad-green)";
        if ([5, 6, 7].includes(type)) return "url(#grad-blue)";
        return '#ccc';
    };

    // Helper to get coordinates
    // -90 is Top (12 o'clock)
    const getCoordinates = (r, typeIndex) => {
        const angleStart = -90;
        const angle = (angleStart + (typeIndex * 40)) * (Math.PI / 180);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    // Helper for donut segments
    const describeArc = (x, y, r, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, r, endAngle);
        const end = polarToCartesian(x, y, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (r * Math.cos(angleInRadians)),
            y: centerY + (r * Math.sin(angleInRadians))
        };
    }

    return (
        <div className="enneagram-chart-container" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {gradients}

                {/* Outer Ring Segments */}
                {types.map((type, i) => {
                    const gap = 2; // degrees gap
                    const step = 40;
                    const startAngle = (i * step) - (step / 2) + gap;
                    const endAngle = (i * step) + (step / 2) - gap;

                    const ringMid = 120;
                    const ringWidth = 30;

                    const arc = describeArc(center, center, ringMid, startAngle, endAngle);

                    return (
                        <g key={`seg-${type}`}>
                            {/* Segment */}
                            <path d={arc} fill="none" stroke={getSegmentFill(type)} strokeWidth={ringWidth} />
                            {/* Label */}
                            {(() => {
                                const lp = polarToCartesian(center, center, ringMid, i * 40);
                                return (
                                    <text
                                        x={lp.x}
                                        y={lp.y + 5}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="16"
                                        fontWeight="700"
                                        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                                    >
                                        {type}
                                    </text>
                                );
                            })()}
                        </g>
                    )
                })}

                {/* Spider Web Grid (Behind Data) */}
                {/* Concentric polygons */}
                {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
                    <polygon
                        key={`grid-${idx}`}
                        points={types.map((_, i) => {
                            const { x, y } = getCoordinates(radius * scale, i);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#ddd"
                        strokeWidth="1"
                    />
                ))}

                {/* Radial Spokes */}
                {types.map((_, i) => {
                    const start = { x: center, y: center };
                    const end = getCoordinates(radius, i);
                    return (
                        <line
                            key={`spoke-${i}`}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#ddd"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon Fill */}
                <polygon
                    points={types.map((type, i) => {
                        const maxScore = 18;
                        const score = scores[type] || 0;
                        const r = (score / maxScore) * radius;
                        const { x, y } = getCoordinates(r, i);
                        return `${x},${y}`;
                    }).join(' ')}
                    fill="#ddbe3d"     // Pantone requested
                    fillOpacity="0.6"  // "Ligeramente transparente"
                    stroke="#ddbe3d"
                    strokeWidth="2"
                />

                {/* Data Points - Only Top 3 */}
                {(() => {
                    // Identify Top 3 types
                    const top3Types = Object.entries(scores)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([type]) => parseInt(type));

                    return types.map((type, idx) => {
                        // Only render dot if it's in the top 3
                        if (!top3Types.includes(type)) return null;

                        const maxScore = 18;
                        const score = scores[type] || 0;
                        const r = (score / maxScore) * radius;
                        const { x, y } = getCoordinates(r, idx);
                        return (
                            <circle
                                key={`pt-${idx}`}
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#ddbe3d"
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    });
                })()}

                {/* Center Dot */}
                <circle cx={center} cy={center} r="4" fill="#ddbe3d" />

            </svg>
        </div>
    );
};

export default EnneagramChart;
