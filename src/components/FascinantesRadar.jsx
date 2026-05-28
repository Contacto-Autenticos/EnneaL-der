import React from 'react';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap } from 'lucide-react';


const DOMAIN_STYLES = {
    corporal: { color: '#cc0000', Icon: User },
    mental: { color: '#ff9100', Icon: Brain },
    emocional: { color: '#ffee00', Icon: HeartPulse },
    social: { color: '#00ff00', Icon: Handshake },
    espiritual: { color: '#00e5ff', Icon: Eye },
    financiero: { color: '#d500f9', Icon: TrendingUp }
};

const CustomTick = ({ payload, x, y, cx, cy, index, isPDF, ...props }) => {
    if (!payload || !payload.value) return null;
    const domainId = payload.value.toLowerCase().replace('dominio ', '');
    const style = DOMAIN_STYLES[domainId] || { color: '#ddbe3d', Icon: Zap };
    const { Icon } = style;
    
    // Split domain name into two lines: "DOMINIO" and the identifier
    const words = payload.value.split(' ');
    const line1 = words[0].toUpperCase();
    const line2 = words[1].toUpperCase();

    // Calculate angle from center to push labels OUTSIDE the radar
    const angle = Math.atan2(y - cy, x - cx);
    const isMobile = !isPDF && typeof window !== 'undefined' && window.innerWidth < 600;
    
    // Adjusted repulsion for better mobile view
    const repulsion = isMobile ? 14 : 30; 
    const labelX = x + Math.cos(angle) * repulsion;
    const labelY = y + Math.sin(angle) * repulsion;

    // Positioning logic for text relative to the icon center
    let textX = 0;
    let textY = 0;
    let anchor = "middle";

    switch(domainId) {
        case 'corporal': // Top: Text ABOVE icon
            textY = isMobile ? -18 : -24;
            break;
        case 'mental': // Top-Right: Icon LEFT, text RIGHT
        case 'emocional': // Bottom-Right: Icon LEFT, text RIGHT
            textX = isMobile ? 16 : 22;
            anchor = "start";
            break;
        case 'social': // Bottom: Text BELOW icon
            textY = isMobile ? 12 : 16; 
            break;
        case 'espiritual': // Bottom-Left: Text LEFT, icon RIGHT
        case 'financiero': // Top-Left: Text LEFT, icon RIGHT
            textX = isMobile ? -16 : -22;
            anchor = "end";
            break;
    }

    return (
        <g transform={`translate(${labelX},${labelY})`}>


            {/* Pure SVG Icon container */}
            <g transform={isMobile ? "translate(-8, -8)" : "translate(-11, -11)"}>
                <Icon 
                    size={isMobile ? 16 : 22} 
                    stroke={style.color} 
                    strokeWidth={2.2} 
                />
            </g>

            {/* Two-line label text - Only show on desktop or when forced (PDF) */}
            {(!isMobile || isPDF) && (
                <text 
                    x={textX} 
                    y={textY} 
                    textAnchor={anchor}
                    className={isPDF ? "pdf-label-visible" : "radar-label-text"}
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        pointerEvents: 'none',
                        display: 'block'
                    }}
                >
                    <tspan 
                        x={textX} 
                        dy={domainId === 'social' ? '1.2em' : domainId === 'corporal' ? '-1.3em' : '0.15em'}
                        fill={isPDF ? "#6b7280" : (props.isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")}
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="1px"
                    >
                        {line1}
                    </tspan>
                    <tspan 
                        x={textX} 
                        dy="1.2em"
                        fill={props.isDark ? "#ffffff" : "#003049"}
                        fontSize="12px"
                        fontWeight="800"
                        letterSpacing="0.5px"
                    >
                        {line2}
                    </tspan>
                </text>
            )}
        </g>
    );
};

const CustomLabel = ({ x, y, value }) => {
    const percentage = Math.round((value / 70) * 100);
    const displayText = `${percentage}%`;
    return (
        <g>
            <rect 
                x={x - 18} 
                y={y - 10} 
                width="36" 
                height="20" 
                rx="4" 
                fill="rgba(45, 55, 72, 0.95)" 
                stroke="rgba(255, 255, 255, 0.3)" 
                strokeWidth="1"
            />
            <text 
                x={x} 
                y={y + 5} 
                textAnchor="middle" 
                fill="#fff" 
                fontSize="12" 
                fontWeight="900"
                style={{ fontFamily: 'Inter, sans-serif' }}
            >
                {displayText}
            </text>
        </g>
    );
};

const FascinantesRadar = ({ data, height = 720, radius, isPDF, transparent = false, isDark = false }) => {
    const isMobile = !isPDF && typeof window !== 'undefined' && window.innerWidth < 600;
    const radarRadius = radius || (isMobile ? "90%" : "50%");

    return (
        <div className="fascinantes-radar-container" style={{ 
            width: '100%', 
            height: height, 
            background: transparent ? 'transparent' : '#ffffff', 
            borderRadius: '30px', 
            padding: '40px',
            border: transparent ? 'none' : '1px solid rgba(0,0,0,0.05)', 
            boxShadow: transparent ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.05)', 
            position: 'relative',
            overflow: 'visible' 
        }}>
            <ResponsiveContainer width={isPDF ? "100%" : "100%"} height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={radarRadius} data={data}>
                    <defs>
                        <radialGradient id="radarRadialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#ffee00" stopOpacity={0.5} />
                            <stop offset="50%" stopColor="#ddbe3d" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#8a6d00" stopOpacity={0.5} />
                        </radialGradient>
                    </defs>
                    <PolarGrid polarLines={false} stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                    {/* Background depth levels */}
                    {[70, 52.5, 35, 17.5].map((level, index) => (
                        <Radar
                            key={`bg-${level}`}
                            dataKey={() => level}
                            stroke="none"
                            fill={isDark ? `rgba(255,255,255,${0.03 - index * 0.005})` : `rgba(0,0,0,${0.03 - index * 0.005})`}
                            fillOpacity={1}
                            isAnimationActive={false}
                            dot={false}
                            activeDot={false}
                        />
                    ))}

                    <PolarAngleAxis 
                        dataKey="domain" 
                        tick={<CustomTick isPDF={isPDF} isDark={isDark} />}
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 70]} 
                        tick={false} 
                        axisLine={false}
                    />
                    <Radar
                        name="Crecimiento"
                        dataKey="score"
                        stroke="#ddbe3d"
                        strokeWidth={2}
                        fill="url(#radarRadialGradient)"
                        fillOpacity={1}
                        isAnimationActive={!isPDF}
                        animationDuration={1500}
                        dot={{ r: 4, fill: '#fff', stroke: '#ddbe3d', strokeWidth: 2 }}
                        label={<CustomLabel cx="50%" cy="50%" />}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(FascinantesRadar);
