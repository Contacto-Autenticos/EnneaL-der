import React from 'react';

const EnneagramChart = ({ scores, phase = 6, top3Types = [] }) => {
    // Config
    const size = 300;
    const center = size / 2;
    const radius = 95; // Maximized for the larger container

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

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
    );

    // Colors per type group
    const getSegmentFill = (type) => {
        const isTop3 = top3Types.includes(parseInt(type));

        // Phase 1-2: All gray
        if (phase < 3) return '#e0e0e0';

        // Phase 3+: Top 3 in color, others stay gray
        if (isTop3) {
            if ([8, 9, 1].includes(parseInt(type))) return "url(#grad-red)";
            if ([2, 3, 4].includes(parseInt(type))) return "url(#grad-green)";
            if ([5, 6, 7].includes(parseInt(type))) return "url(#grad-blue)";
        }

        return '#e0e0e0';
    };

    const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (r * Math.cos(angleInRadians)),
            y: centerY + (r * Math.sin(angleInRadians))
        };
    }

    const describeArc = (x, y, r, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, r, endAngle);
        const end = polarToCartesian(x, y, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const getCoordinates = (r, typeIndex) => {
        const angleStart = -90;
        const angle = (angleStart + (typeIndex * 40)) * (Math.PI / 180);
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    return (
        <div className={`enneagram-chart-container phase-${phase}`} style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
            <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {gradients}

                {/* Outer Ring Segments */}
                {types.map((type, i) => {
                    const isTop3 = top3Types.includes(parseInt(type));
                    const ringMid = 125;
                    const ringWidth = 30;
                    const gap = 1.2;
                    const step = 40;
                    const startAngle = (i * step) - (step / 2) + gap;
                    const endAngle = (i * step) + (step / 2) - gap;

                    const arc = describeArc(center, center, ringMid, startAngle, endAngle);

                    return (
                        <g key={`seg-${type}`} className={(isTop3 && phase >= 3) ? "top-segment-active" : ""}>
                            <path
                                d={arc}
                                fill="none"
                                stroke={getSegmentFill(type)}
                                strokeWidth={ringWidth}
                                style={{
                                    transition: 'stroke 0.8s ease-out, opacity 0.8s, filter 0.8s',
                                    filter: (isTop3 && phase >= 3) ? 'url(#glow)' : 'none',
                                    opacity: phase === 1 ? 0.3 : 1
                                }}
                            />
                            {(() => {
                                const lp = polarToCartesian(center, center, ringMid, i * 40);
                                const isActive = isTop3 && phase >= 3;
                                return (
                                    <text
                                        x={lp.x}
                                        y={lp.y + 5}
                                        textAnchor="middle"
                                        fill={isActive ? "white" : "#999"}
                                        fontSize="14"
                                        fontWeight="800"
                                        style={{
                                            transition: 'all 0.8s ease-out',
                                            textShadow: isActive ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none'
                                        }}
                                    >
                                        {type}
                                    </text>
                                );
                            })()}
                        </g>
                    )
                })}

                {/* Spider Web Grid */}
                {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
                    <polygon
                        key={`grid-${idx}`}
                        points={types.map((_, i) => {
                            const { x, y } = getCoordinates(radius * scale, i);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#ddd"
                        strokeWidth="1.5"
                        style={{ opacity: phase === 1 ? 0.3 : 0.8, transition: 'opacity 1s' }}
                    />
                ))}

                {/* Radial Spokes */}
                {types.map((_, i) => {
                    const end = getCoordinates(radius, i);
                    return (
                        <line
                            key={`spoke-${i}`}
                            x1={center} y1={center}
                            x2={end.x} y2={end.y}
                            stroke="#ddd"
                            strokeWidth="1.5"
                            style={{ opacity: phase === 1 ? 0.3 : 0.8, transition: 'opacity 1s' }}
                        />
                    );
                })}

                {/* Data Polygon Fill - Phase 2+ */}
                {phase >= 2 && (
                    <polygon
                        points={types.map((type, i) => {
                            const maxScore = 18;
                            const score = scores[type] || scores[type.toString()] || 0;
                            // Scale by phase for drawing effect in phase 2
                            const scale = phase === 2 ? 1 : 1;
                            const r = (score / maxScore) * radius * scale;
                            const { x, y } = getCoordinates(r, i);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="#ddbe3d"
                        fillOpacity="0.4"
                        stroke="#ddbe3d"
                        strokeWidth="2"
                        className="radar-polygon-anim"
                        style={{ transition: 'all 1.5s ease-out' }}
                    />
                )}

                {/* Top 3 Result Dots */}
                {phase >= 2 && types.map((type, i) => {
                    const isTop3 = top3Types.includes(parseInt(type));
                    if (!isTop3) return null;

                    const maxScore = 18;
                    const score = scores[type] || scores[type.toString()] || 0;
                    const r = (score / maxScore) * radius;
                    const { x, y } = getCoordinates(r, i);

                    return (
                        <circle
                            key={`dot-${type}`}
                            cx={x} cy={y}
                            r="5"
                            fill="#ddbe3d"
                            stroke="#ffffff"
                            strokeWidth="2"
                            opacity={phase >= 3 ? 1 : 0}
                            style={{
                                transition: 'opacity 0.8s ease-out 0.3s',
                                filter: 'drop-shadow(0px 0px 4px rgba(221, 190, 61, 0.8))'
                            }}
                        />
                    );
                })}

                {/* Center Dot */}
                <circle cx={center} cy={center} r="4" fill="#ddbe3d" opacity={phase >= 2 ? 1 : 0} style={{ transition: 'opacity 0.5s' }} />

            </svg>
        </div>
    );
};

export default EnneagramChart;
