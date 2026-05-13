import React, { useState } from 'react';
import './LiderazgoRadarChart.css';

const DIMENSION_COLORS = {
    personal: '#0088ff',
    estrategico: '#ff9100',
    relacional: '#ddbe3d',
    multiplicador: '#00aa00',
    trascendente: '#aa00ff'
};

const LiderazgoRadarChart = ({ dimensions }) => {
    const [tooltip, setTooltip] = useState(null);
    const cx = 230;
    const cy = 230;
    const maxRadius = 210; // Increased size
    const numDimensions = dimensions.length;
    const sliceAngle = 360 / numDimensions;
    const startOffset = -90;

    const createSlicePath = (index, radiusPercent) => {
        const radius = (radiusPercent / 100) * maxRadius;
        const startAngleDeg = startOffset + index * sliceAngle;
        const endAngleDeg = startAngleDeg + sliceAngle;
        const startAngleRad = (Math.PI / 180) * startAngleDeg;
        const endAngleRad = (Math.PI / 180) * endAngleDeg;

        const x1 = cx + radius * Math.cos(startAngleRad);
        const y1 = cy + radius * Math.sin(startAngleRad);
        const x2 = cx + radius * Math.cos(endAngleRad);
        const y2 = cy + radius * Math.sin(endAngleRad);

        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    };

    const levels = 5;
    const ringPaths = Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxRadius;
        return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
    });

    const dividers = Array.from({ length: numDimensions }, (_, i) => {
        const angleDeg = startOffset + i * sliceAngle;
        const angleRad = (Math.PI / 180) * angleDeg;
        return {
            x2: cx + maxRadius * Math.cos(angleRad),
            y2: cy + maxRadius * Math.sin(angleRad)
        };
    });

    const handleMouseMove = (e, dim) => {
        const rect = e.currentTarget.closest('.lr-radar-chart-container').getBoundingClientRect();
        setTooltip({
            name: dim.name,
            score: dim.score,
            color: DIMENSION_COLORS[dim.id],
            interp: dim.interpretation?.label,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 100 // Increased offset to avoid overlap
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="lr-radar-section">
            <div className="lr-radar-layout">
                <div className="lr-radar-chart-container">
                    <svg viewBox="0 0 460 460" className="lr-radar-svg">
                        <circle cx={cx} cy={cy} r={maxRadius} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />

                        {ringPaths.map((d, i) => (
                            <path
                                key={`ring-${i}`}
                                d={d}
                                fill="none"
                                stroke="white"
                                strokeWidth={i === levels - 1 ? 1.5 : 0.8}
                                strokeOpacity={0.4}
                            />
                        ))}

                        {dimensions.map((dim, i) => (
                            <path
                                key={`slice-${dim.id}`}
                                d={createSlicePath(i, dim.percentage)}
                                fill={DIMENSION_COLORS[dim.id]}
                                fillOpacity="0.7"
                                stroke={DIMENSION_COLORS[dim.id]}
                                strokeWidth="1"
                                className="lr-polar-slice"
                                style={{ animationDelay: `${i * 0.15}s`, cursor: 'pointer' }}
                                onMouseMove={(e) => handleMouseMove(e, dim)}
                                onMouseLeave={handleMouseLeave}
                            />
                        ))}

                        {dividers.map((line, i) => (
                            <line
                                key={`div-${i}`}
                                x1={cx}
                                y1={cy}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="white"
                                strokeWidth="2.5"
                                style={{ pointerEvents: 'none' }}
                            />
                        ))}

                        <circle cx={cx} cy={cy} r="5" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    </svg>

                    {/* Dynamic Tooltip */}
                    {tooltip && (
                        <div 
                            className="lr-chart-tooltip" 
                            style={{ left: tooltip.x, top: tooltip.y }}
                        >
                            <div className="lr-tooltip-color" style={{ background: tooltip.color }} />
                            <div className="lr-tooltip-content">
                                <span className="lr-tooltip-name">{tooltip.name}</span>
                                <span className="lr-tooltip-score">{tooltip.score}/50</span>
                                <span className="lr-tooltip-interp">{tooltip.interp}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend cards */}
                <div className="lr-radar-legend">
                    {dimensions.map(dim => (
                        <div key={dim.id} className="lr-radar-legend-item">
                            <div
                                className="lr-legend-color"
                                style={{ background: DIMENSION_COLORS[dim.id] }}
                            />
                            <div className="lr-legend-info">
                                <div className="lr-legend-top">
                                    <span className="lr-legend-name">{dim.name}</span>
                                    <span className="lr-legend-score">{dim.score}/50</span>
                                </div>
                                <div className="lr-legend-bar-bg">
                                    <div
                                        className="lr-legend-bar-fill"
                                        style={{
                                            width: `${dim.percentage}%`,
                                            background: DIMENSION_COLORS[dim.id]
                                        }}
                                    />
                                </div>
                                <span className="lr-legend-interp">{dim.interpretation?.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiderazgoRadarChart;
