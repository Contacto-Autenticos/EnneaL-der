import React, { useState } from 'react';
import { User, Target, MessageSquare, Users, Star } from 'lucide-react';
import './LiderazgoRadarChart.css';

const getIcon = (id) => {
    switch(id) {
        case 'personal': return <User size={16} />;
        case 'estrategico': return <Target size={16} />;
        case 'relacional': return <MessageSquare size={16} />;
        case 'multiplicador': return <Users size={16} />;
        case 'trascendente': return <Star size={16} />;
        default: return null;
    }
};

const DIMENSION_COLORS = {
    personal: '#0088ff',
    estrategico: '#ff9100',
    relacional: '#ddbe3d',
    multiplicador: '#00aa00',
    trascendente: '#aa00ff'
};

const LiderazgoRadarChart = ({ dimensions }) => {
    const [tooltip, setTooltip] = useState(null);
    const cx = 300;
    const cy = 300;
    const maxRadius = 225; 
    const numDimensions = dimensions.length;
    const sliceAngle = 360 / numDimensions;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y, 
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    // Text path that ensures labels always read left-to-right
    // Bottom half (90°-270°): counterclockwise path
    // Top half (0°-90° and 270°-360°): clockwise path
    const describeArcForText = (x, y, radius, startAngle, endAngle) => {
        const midAngle = (startAngle + endAngle) / 2;
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        if (midAngle >= 90 && midAngle <= 270) {
            // Bottom half: counterclockwise (sweep-flag 0)
            const start = polarToCartesian(x, y, radius, endAngle);
            const end = polarToCartesian(x, y, radius, startAngle);
            return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
        } else {
            // Everything else: clockwise (sweep-flag 1)
            const start = polarToCartesian(x, y, radius, startAngle);
            const end = polarToCartesian(x, y, radius, endAngle);
            return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
        }
    };

    const createSlicePath = (index, radiusPercent) => {
        const radius = (radiusPercent / 100) * maxRadius;
        const startAngleDeg = index * sliceAngle;
        const endAngleDeg = (index + 1) * sliceAngle;
        const start = polarToCartesian(cx, cy, radius, startAngleDeg);
        const end = polarToCartesian(cx, cy, radius, endAngleDeg);
        const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
    };

    // New: Path for full-radius hit area to capture hover events more easily
    const createHitAreaPath = (index) => {
        const radius = maxRadius + 80; // Extend to cover labels and icons
        const startAngleDeg = index * sliceAngle;
        const endAngleDeg = (index + 1) * sliceAngle;
        const start = polarToCartesian(cx, cy, radius, startAngleDeg);
        const end = polarToCartesian(cx, cy, radius, endAngleDeg);
        const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? "0" : "1";
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
    };

    const levels = 5;
    const ringCircles = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * maxRadius);

    const handleMouseMove = (e, dim) => {
        const container = e.currentTarget.closest('.lr-radar-chart-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        setTooltip({
            name: dim.name,
            score: dim.score,
            color: DIMENSION_COLORS[dim.id],
            interp: dim.interpretation?.label,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 15 // Adjusted positioning
        });
    };

    return (
        <div className="lr-radar-section wheel-mode">
            <div className="lr-radar-layout">
                <div className="lr-radar-chart-container">
                    <svg viewBox="0 0 600 600" className="lr-radar-svg">
                        {/* Background Rings */}
                        {ringCircles.map((r, i) => (
                            <circle
                                key={`ring-${i}`}
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="1.5"
                                strokeDasharray={i === levels - 1 ? "0" : "6 4"}
                                style={{ pointerEvents: 'none' }}
                            />
                        ))}

                        {/* Level Numbers */}
                        {ringCircles.map((r, i) => (
                            i === 0 ? null : ( // Skip level 1 (too close to center)
                            <text
                                key={`num-${i}`}
                                x={cx + 12}
                                y={cy - r - 5}
                                className="lr-level-num"
                                style={{ pointerEvents: 'none' }}
                            >
                                {i + 1}
                            </text>
                            )
                        ))}

                        {/* Slices (Visual) */}
                        {dimensions.map((dim, i) => (
                            <path
                                key={`slice-${dim.id}`}
                                d={createSlicePath(i, dim.percentage)}
                                fill={DIMENSION_COLORS[dim.id]}
                                fillOpacity="0.4"
                                stroke={DIMENSION_COLORS[dim.id]}
                                strokeWidth="1.5"
                                className="lr-polar-slice"
                                style={{ 
                                    animationDelay: `${i * 0.1}s`, 
                                    pointerEvents: 'none' // Let hit areas handle events
                                }}
                            />
                        ))}

                        {/* Hit Areas (Invisible but interactive) */}
                        {dimensions.map((dim, i) => (
                            <path
                                key={`hit-${dim.id}`}
                                d={createHitAreaPath(i)}
                                fill="transparent"
                                className="lr-hit-area"
                                onMouseMove={(e) => handleMouseMove(e, dim)}
                                onMouseLeave={() => setTooltip(null)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}

                        {/* Outer Dividers */}
                        {dimensions.map((_, i) => {
                            const p = polarToCartesian(cx, cy, maxRadius + 90, i * sliceAngle);
                            return (
                                <line
                                    key={`div-${i}`}
                                    x1={cx} y1={cy} x2={p.x} y2={p.y}
                                    stroke="#94a3b8"
                                    strokeWidth="1.5"
                                    strokeOpacity="0.6"
                                    style={{ pointerEvents: 'none' }}
                                />
                            );
                        })}

                        {/* Outer Labels & Icons */}
                        {dimensions.map((dim, i) => {
                            const midAngle = i * sliceAngle + sliceAngle / 2;
                            const iconPos = polarToCartesian(cx, cy, maxRadius + 55, midAngle);
                            const arcRadius = maxRadius + 15;
                            const textPathId = `textPath-${dim.id}`;
                            
                            const startAngle = i * sliceAngle;
                            const endAngle = (i + 1) * sliceAngle;

                            const arcPath = describeArc(cx, cy, arcRadius, i * sliceAngle + 2, (i + 1) * sliceAngle - 2);
                            const textPathDef = describeArcForText(cx, cy, arcRadius, startAngle, endAngle);

                            return (
                                <g key={`label-${dim.id}`} style={{ pointerEvents: 'none' }}>
                                    <defs>
                                        <path id={textPathId} d={textPathDef} />
                                    </defs>

                                    {/* Outer Color Arc */}
                                    <path
                                        d={arcPath}
                                        fill="none"
                                        stroke={DIMENSION_COLORS[dim.id]}
                                        strokeWidth="20"
                                        strokeLinecap="round"
                                        opacity="0.8"
                                    />
                                    
                                    {/* Curved Dimension Name */}
                                    <text className="lr-wheel-label" fill="white">
                                        <textPath 
                                            href={`#${textPathId}`} 
                                            startOffset="50%" 
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            {dim.name.replace('Liderazgo', '').trim().toUpperCase()}
                                        </textPath>
                                    </text>

                                    {/* Icon at outer tip */}
                                    <g transform={`translate(${iconPos.x - 12}, ${iconPos.y - 12})`}>
                                        <circle r="16" cx="12" cy="12" fill="white" stroke={DIMENSION_COLORS[dim.id]} strokeWidth="1.5" />
                                        <g transform="translate(4, 4)" style={{ color: DIMENSION_COLORS[dim.id] }}>
                                            {getIcon(dim.id)}
                                        </g>
                                    </g>
                                </g>
                            );
                        })}

                        {/* Center Circle */}
                        <circle cx={cx} cy={cy} r="45" fill="white" stroke="#e2e8f0" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                        <text x={cx} y={cy + 4} textAnchor="middle" className="lr-center-text" style={{ pointerEvents: 'none' }}>LIDERAZGO</text>
                    </svg>

                    {/* Tooltip */}
                    {tooltip && (
                        <div className="lr-chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                            <div className="lr-tooltip-color" style={{ background: tooltip.color }} />
                            <div className="lr-tooltip-content">
                                <span className="lr-tooltip-name">{tooltip.name}</span>
                                <span className="lr-tooltip-score">{tooltip.score}/50</span>
                                <span className="lr-tooltip-interp">{tooltip.interp}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiderazgoRadarChart;

