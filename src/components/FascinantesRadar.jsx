import React from 'react';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap } from 'lucide-react';


const DOMAIN_STYLES = {
    corporal: { color: '#ff3131', Icon: User },
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
    // Recharts uses cx/cy for the chart center. 
    // We use the actual center provided by Recharts now.
    const angle = Math.atan2(y - cy, x - cx);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
    const repulsion = isMobile ? 15 : 35; 
    const labelX = x + Math.cos(angle) * repulsion;
    const labelY = y + Math.sin(angle) * repulsion;

    // Configuration based on domain requirement:
    // Corporal: Text above icon
    // Mental/Emocional: Icon left, text right
    // Social: Text below icon
    // Espiritual/Financiero: Text left, icon right
    
    let textStyle = { position: 'absolute' };
    
    switch(domainId) {
        case 'corporal': // Top
            textStyle = { ...textStyle, bottom: 'calc(50% + 20px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' };
            break;
        case 'mental': // Top-Right
        case 'emocional': // Bottom-Right
            textStyle = { ...textStyle, left: 'calc(50% + 20px)', top: '50%', transform: 'translateY(-50%)', textAlign: 'left' };
            break;
        case 'social': // Bottom
            textStyle = { ...textStyle, top: 'calc(50% + 20px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' };
            break;
        case 'espiritual': // Bottom-Left
        case 'financiero': // Top-Left
            textStyle = { ...textStyle, right: 'calc(50% + 20px)', top: '50%', transform: 'translateY(-50%)', textAlign: 'right' };
            break;
    }

    // Centering the foreignObject on the new pushed label position
    const width = 180;
    const height = 100;
    const offsetX = labelX - width / 2;
    const offsetY = labelY - height / 2;

    return (
        <g transform={`translate(${offsetX},${offsetY})`}>
            <foreignObject width={width} height={height} style={{ overflow: 'visible' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {/* ICON: Exactly at center-center of foreignObject (which is at radar vertex) */}
                    <div style={{ 
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: style.color, 
                        filter: `drop-shadow(0 0 5px ${style.color})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}>
                        <Icon size={30} strokeWidth={2.5} />
                    </div>

                    {/* TEXT: Positioned relative to the center icon */}
                    <div className="radar-label-text" style={{ 
                        ...textStyle,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px'
                    }}>
                        <span style={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            fontSize: '9px', 
                            fontWeight: 700, 
                            letterSpacing: '1px'
                        }}>
                            {line1}
                        </span>
                        <span style={{ 
                            color: '#fff', 
                            fontSize: '12px', 
                            fontWeight: 800, 
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap'
                        }}>
                            {line2}
                        </span>
                    </div>
                </div>
            </foreignObject>
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
        <div className="fascinantes-radar-container" style={{ width: '100%', height: 720, background: 'rgba(0, 18, 29, 0.4)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={radarRadius} data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
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
                        fill="#ddbe3d"
                        fillOpacity={0.4}
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
