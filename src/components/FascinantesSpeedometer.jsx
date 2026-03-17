import React from 'react';
import './FascinantesSpeedometer.css';

const FascinantesSpeedometer = ({ value, label }) => {
    // Value is 1-5
    const percentage = ((value) / 5) * 100;
    const rotation = -90 + (percentage * 1.8); // -90 to 90 degrees for half circle

    const getInterpretation = (val) => {
        if (val === 1) return "Muy bajo";
        if (val === 2) return "Bajo";
        if (val === 3) return "Medio";
        if (val === 4) return "Alto";
        if (val === 5) return "Muy alto";
        return "Pendiente";
    };

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
                                <stop offset="0%" stopColor="#8a6a00" />
                                <stop offset="100%" stopColor="#ddbe3d" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="speedometer-needle-v2" style={{ transform: `rotate(${-90 + (percentage * 1.8)}deg)` }}>
                        <div className="needle-head"></div>
                    </div>
                    
                    <div className="speedometer-center-v2"></div>
                </div>
                
                <div className="speedometer-info-v2">
                    <span className="info-text">{getInterpretation(value)}</span>
                </div>

                <p className="intensity-label-internal">NIVEL DE INTENSIDAD</p>
            </div>
            {label && <p className="speedometer-main-label">{label}</p>}
        </div>
    );
};

export default FascinantesSpeedometer;
