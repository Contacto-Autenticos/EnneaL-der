import React from 'react';
import './LiderazgoSpeedometer.css';

const LiderazgoSpeedometer = ({ value, domain = 'relacional', showLabels = true, showInfo = true }) => {
    const numericValue = parseInt(value);
    
    // Logic copied from FascinantesSpeedometer: 1 -> 20%, 5 -> 100%
    const percentage = (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) 
        ? (numericValue / 5) * 100 
        : 0;

    const VALUE_CONFIGS = {
        1: { label: "Nunca", colors: ["#665200", "#8a6a00"] },
        2: { label: "Rara vez", colors: ["#8a6a00", "#b28a00"] },
        3: { label: "Algunas veces", colors: ["#b28a00", "#ddbe3d"] },
        4: { label: "Frecuentemente", colors: ["#ddbe3d", "#f0d560"] },
        5: { label: "Consistentemente", colors: ["#f0d560", "#ffffff"] },
        default: { label: null, colors: ["#94a3b8", "#cbd5e1"] }
    };

    const config = VALUE_CONFIGS[numericValue] || VALUE_CONFIGS.default;

    // rotation from -90 (answer 1) to 90 (answer 5)
    // We use a very strict cap and round to avoid floating point issues
    const rotation = Math.min(90, Math.max(-90, -90 + (percentage * 1.8)));

    const DOMAIN_COLORS = {
        personal: { start: "#004080", end: "#0099ff" },
        estrategico: { start: "#b35900", end: "#ff9933" },
        relacional: { start: "#8a6a00", end: "#ddbe3d" },
        multiplicador: { start: "#006622", end: "#33cc55" },
        trascendente: { start: "#5900b3", end: "#b366ff" },
        control: { start: "#334155", end: "#94a3b8" }
    };
    const dColor = DOMAIN_COLORS[domain] || DOMAIN_COLORS.relacional;

    return (
        <div className="l-speedometer-wrapper">
            <div className="l-speedometer-container">
                <div className="l-speedometer-main" style={{ aspectRatio: '2 / 1' }}>
                    <svg viewBox="0 0 200 100" className="l-speedometer-svg" style={{ display: 'block' }}>
                        <defs>
                            <linearGradient 
                                id={`l-grad-${domain}`} 
                                x1="20" y1="0" x2="180" y2="0" 
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor={dColor.start} />
                                <stop offset="100%" stopColor={dColor.end} />
                            </linearGradient>
                        </defs>
                        
                        {/* Background arc */}
                        <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke="#94a3b8" 
                            strokeWidth="18" 
                            strokeLinecap="round"
                        />

                        {/* Fill arc */}
                        <path 
                            d="M 20 100 A 80 80 0 0 1 180 100" 
                            fill="none" 
                            stroke={`url(#l-grad-${domain})`} 
                            strokeWidth="18" 
                            strokeDasharray="251.32 1000"
                            strokeDashoffset={251.32 - (percentage * 2.5132)}
                            strokeLinecap="round"
                            className="l-speed-fill-path"
                        />

                        {/* Dividers */}
                        {[216, 252, 288, 324].map((angle, i) => (
                             <line 
                                key={i} 
                                x1={100 + 71 * Math.cos(Math.PI * angle / 180)} 
                                y1={100 + 71 * Math.sin(Math.PI * angle / 180)} 
                                x2={100 + 89 * Math.cos(Math.PI * angle / 180)} 
                                y2={100 + 89 * Math.sin(Math.PI * angle / 180)} 
                                stroke="#ffffff" 
                                strokeWidth="2" 
                                strokeOpacity="0.8"
                             />
                        ))}
                    </svg>

                    <div 
                        className="l-speedometer-needle" 
                        style={{ 
                            transform: `rotate(${rotation}deg)`,
                            bottom: '0px'
                        }}
                    >
                        <div className="l-needle-line"></div>
                        <div className="l-needle-circle"></div>
                    </div>
                </div>
                
                <div className="l-speedometer-labels-area">
                    {showLabels && (
                        <div className="l-intensity-box">
                            <p className="l-intensity-sub">
                                {config.label || "NIVEL DE INTENSIDAD"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiderazgoSpeedometer;
