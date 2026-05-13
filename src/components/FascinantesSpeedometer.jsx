import React from 'react';
import './FascinantesSpeedometer.css';

const FascinantesSpeedometer = ({ value, label }) => {
    // Value is 1-5, default to 0 if invalid or "Pendiente"
    const percentage = (value >= 1 && value <= 5) ? (value / 5) * 100 : 0;
    const rotation = -90 + (percentage * 1.8); // -90 to 90 degrees for half circle

    const VALUE_CONFIGS = {
        1: { label: "Crítico", colors: ["#660000", "#ff3333"] },
        2: { label: "Bajo", colors: ["#8a3a00", "#ff9100"] },
        3: { label: "Medio", colors: ["#8a6a00", "#ddbe3d"] },
        4: { label: "Alto", colors: ["#004d00", "#00ff3c"] },
        5: { label: "Óptimo", colors: ["#002d44", "#00e5ff"] },
        default: { label: "Pendiente", colors: ["#1a2a3a", "#2c3e50"] }
    };

    const config = VALUE_CONFIGS[value] || VALUE_CONFIGS.default;

    return (
        <div className="speedometer-wrapper">
            <div className="speedometer-container">
                <div className="speedometer-main">
                    {/* Background segments */}
                    <svg viewBox="0 0 200 100" className="speedometer-svg">
                        <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke="#1a2a3a" 
                            strokeWidth="20" 
                        />
                        {/* Filling progress path */}
                        <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke="url(#speed-gradient)" 
                            strokeWidth="20" 
                            strokeDasharray="251.32"
                            strokeDashoffset={251.32 - (percentage * 2.5132)}
                            className="speed-fill-path"
                        />

                        {/* 5 segments dividers (on top of the arc) */}
                        {[216, 252, 288, 324].map((angle, i) => (
                             <line 
                                 key={i} 
                                 x1="100" 
                                 y1="100" 
                                 x2={100 + 100 * Math.cos(Math.PI * angle / 180)} 
                                 y2={100 + 100 * Math.sin(Math.PI * angle / 180)} 
                                 stroke="#00121d" 
                                 strokeWidth="2" 
                             />
                        ))}
                        
                        <defs>
                            <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={config.colors[0]} style={{ transition: 'stop-color 0.5s' }} />
                                <stop offset="100%" stopColor={config.colors[1]} style={{ transition: 'stop-color 0.5s' }} />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="speedometer-needle-v2" style={{ transform: `rotate(${-90 + (percentage * 1.8)}deg)` }}>
                        <svg className="needle-head-svg" viewBox="0 0 10 10" width="12" height="12">
                            <path 
                                d="M 5 0 L 10 10 L 0 10 Z" 
                                fill={config.colors[1]} 
                                stroke="#001d2d" 
                                strokeWidth="1"
                                strokeLinejoin="round"
                                style={{ transition: 'fill 0.5s' }}
                            />
                        </svg>
                    </div>
                    
                    <div className="speedometer-center-v2" style={{ borderColor: config.colors[1], transition: 'border-color 0.5s' }}></div>
                </div>
                
                <div className="speedometer-info-v2" style={{ borderColor: `${config.colors[1]}66` }}>
                    <span className="info-text" style={{ color: config.colors[1], transition: 'color 0.5s' }}>
                        {config.label}
                    </span>
                </div>

                <p className="intensity-label-internal">NIVEL DE INTENSIDAD</p>
            </div>
            {label && <p className="speedometer-main-label">{label}</p>}
        </div>
    );
};

export default FascinantesSpeedometer;
