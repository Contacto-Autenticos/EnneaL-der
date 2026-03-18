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

const CustomTick = ({ payload, x, y, cx, cy, index, ...props }) => {
    const domainId = payload.value.toLowerCase().replace('dominio ', '');
    const style = DOMAIN_STYLES[domainId] || { color: '#ddbe3d', Icon: Zap };
    const { Icon } = style;
    
    // Split domain name into two lines: "DOMINIO" and the identifier
    const words = payload.value.split(' ');
    const line1 = words[0].toUpperCase();
    const line2 = words[1].toUpperCase();

    // Calculate angle from center to push labels OUTSIDE the radar
    const angle = Math.atan2(y - cy, x - cx);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    
    // Adjusted repulsion for better mobile view
    const repulsion = isMobile ? 32 : 45; 
    const labelX = x + Math.cos(angle) * repulsion;
    const labelY = y + Math.sin(angle) * repulsion;

    // Positioning logic for text relative to the icon center
    let textX = 0;
    let textY = 0;
    let anchor = "middle";

    switch(domainId) {
        case 'corporal': // Top: Text ABOVE icon
            textY = -28;
            break;
        case 'mental': // Top-Right: Icon LEFT, text RIGHT
        case 'emocional': // Bottom-Right: Icon LEFT, text RIGHT
            textX = 26;
            anchor = "start";
            break;
        case 'social': // Bottom: Text BELOW icon
            textY = 24;
            break;
        case 'espiritual': // Bottom-Left: Text LEFT, icon RIGHT
        case 'financiero': // Top-Left: Text LEFT, icon RIGHT
            textX = -26;
            anchor = "end";
            break;
    }

    return (
        <g transform={`translate(${labelX},${labelY})`}>
            {/* Subtle glow circle behind icon */}
            <circle r="16" fill={style.color} fillOpacity="0.12" />

            {/* Pure SVG Icon container */}
            <g transform="translate(-15, -15)">
                <Icon 
                    size={30} 
                    stroke={style.color} 
                    strokeWidth={2.2} 
                    style={{ filter: `drop-shadow(0 0 5px ${style.color})` }} 
                />
            </g>

            {/* Two-line label text */}
            <text 
                x={textX} 
                y={textY} 
                textAnchor={anchor}
                style={{ 
                    fontFamily: 'Inter, sans-serif',
                    pointerEvents: 'none'
                }}
            >
                <tspan 
                    x={textX} 
                    dy={domainId === 'social' ? '2.2em' : domainId === 'corporal' ? '-1.3em' : '0.15em'}
                    fill="rgba(255,255,255,0.6)"
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="1px"
                >
                    {line1}
                </tspan>
                <tspan 
                    x={textX} 
                    dy="1.2em"
                    fill="#fff"
                    fontSize="13px"
                    fontWeight="800"
                    letterSpacing="0.5px"
                >
                    {line2}
                </tspan>
            </text>
        </g>
    );
};

const CustomLabel = ({ x, y, value }) => {
    return (
        <g>
            <rect 
                x={x - 15.5} 
                y={y - 10} 
                width="31" 
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
                {value}
            </text>
        </g>
    );
};

const FascinantesRadar = ({ data }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    const radarRadius = isMobile ? "90%" : "70%";

    return (
        <div className="fascinantes-radar-container" style={{ width: '100%', height: 720, background: 'rgba(0, 18, 29, 0.4)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={radarRadius} data={data}>
                    <defs>
                        <radialGradient id="radarRadialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#ffee00" stopOpacity={0.5} />
                            <stop offset="50%" stopColor="#ddbe3d" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#8a6d00" stopOpacity={0.5} />
                        </radialGradient>
                    </defs>
                    <PolarGrid polarLines={false} stroke="rgba(255,255,255,0.1)" />
                    {/* Background depth levels - Tonal regions without outlines */}
                    {[100, 75, 50, 25].map((level, index) => (
                        <Radar
                            key={`bg-${level}`}
                            dataKey={() => level}
                            stroke="none"
                            fill={`rgba(255,255,255,${0.02 + index * 0.02})`}
                            fillOpacity={1}
                            isAnimationActive={false}
                            dot={false}
                            activeDot={false}
                        />
                    ))}

                    <PolarAngleAxis 
                        dataKey="domain" 
                        tick={<CustomTick />}
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
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
                        animationDuration={1500}
                        dot={{ r: 4, fill: '#fff', stroke: '#ddbe3d', strokeWidth: 2 }}
                        label={<CustomLabel cx="50%" cy="50%" />}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FascinantesRadar;
