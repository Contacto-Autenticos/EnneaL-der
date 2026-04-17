import React, { forwardRef } from 'react';
import { User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import FascinantesRadar from './FascinantesRadar';
import './FascinantesReportTemplate.css';

const DOMAIN_STYLES = {
    corporal: { color: '#cc0000', class: 'neon-corporal' },
    mental: { color: '#ff9100', class: 'neon-mental' },
    emocional: { color: '#ffee00', class: 'neon-emocional' },
    social: { color: '#00ff00', class: 'neon-social' },
    espiritual: { color: '#00e5ff', class: 'neon-espiritual' },
    financiero: { color: '#d500f9', class: 'neon-financiero' }
};

const getDomainIcon = (domainId) => {
    const props = { size: 24, stroke: 'currentColor', strokeWidth: 2 };
    switch(domainId) {
        case 'corporal': return <User {...props} />;
        case 'mental': return <Brain {...props} />;
        case 'emocional': return <HeartPulse {...props} />;
        case 'social': return <Handshake {...props} />;
        case 'espiritual': return <Eye {...props} />;
        case 'financiero': return <TrendingUp {...props} />;
        default: return <Zap {...props} />;
    }
};

const FascinantesReportTemplate = forwardRef(({ domainScores, analysis }, ref) => {
    if (!domainScores || domainScores.length === 0 || !analysis) return null;
    const minScore = Math.min(...domainScores.map(s => s.score));

    return (
        <div className="fascinantes-pdf-template" ref={ref}>
            {/* PAGE 1: TITLE, RADAR, EXPERT ANALYSIS */}
            <div className="pdf-page" id="pdf-page-1">
                <header className="pdf-header">
                    <h1>RESULTADO<br/>AUTODIAGNÓSTICO</h1>
                </header>

                <div className="pdf-radar-container">
                    <div style={{ width: '700px', height: '430px' }}>
                        <FascinantesRadar data={domainScores} height={430} radius="55%" isPDF={true} />
                    </div>
                </div>

                <div className="pdf-expert-card">
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#4b5563', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        TU ESTADO ACTUAL ES DE:
                    </div>
                    <h2 className="pdf-expert-name" style={{ color: '#f2b705', fontSize: '28px', marginTop: '0', paddingTop: '0' }}>{analysis.name}</h2>
                    <p className="pdf-expert-insight" style={{ color: '#00121d', fontWeight: '800', fontSize: '15px' }}>{analysis.insight}</p>
                    
                    <div className="pdf-expert-grid">
                        <div className="pdf-expert-section">
                            <div className="pdf-expert-section-title" style={{ color: '#f2b705', fontSize: '14px' }}>
                                <Zap size={15} /> EXPLICACIÓN BREVE
                            </div>
                            <p className="pdf-expert-text">{analysis.explanation}</p>
                        </div>
                        <div className="pdf-expert-section">
                            <div className="pdf-expert-section-title" style={{ color: '#f2b705', fontSize: '14px' }}>
                                <AlertCircle size={15} /> REQUIERE ATENCIÓN
                            </div>
                            <p className="pdf-expert-text">{analysis.critical}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '25px' }}>
                        <div className="pdf-expert-section-title" style={{ color: '#f2b705', fontSize: '14px', marginBottom: '12px' }}>RECOMENDACIONES</div>
                        <ul className="pdf-expert-list">
                            {analysis.recommendations.map((rec, idx) => (
                                <li key={idx} style={{ marginBottom: '10px' }}>
                                    <span style={{ color: '#f2b705', fontWeight: 'bold', marginRight: '8px', fontSize: '18px', lineHeight: '10px' }}>•</span> 
                                    <span style={{ fontSize: '14px', color: '#00121d' }}>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 2: DOMAIN CARDS */}
            <div className="pdf-page" id="pdf-page-2">
                <div style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#f2b705', textTransform: 'uppercase', marginBottom: '12px', marginTop: '0' }}>
                        RESULTADOS POR CADA DOMINIO
                    </h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563', marginBottom: '10px', marginTop: '0' }}>
                        Estos resultados muestran cómo has venido gestionando tu energía, atención y decisiones en cada área de tu vida durante los últimos meses.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563', marginBottom: '10px', marginTop: '0' }}>
                        No es una evaluación de quién eres, sino una fotografía de lo que hoy estás sosteniendo. Más allá del puntaje, lo importante es entender qué hábitos, prioridades y dinámicas están detrás de cada resultado.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#4b5563', marginBottom: '0', marginTop: '0' }}>
                        Obsérvalo con honestidad. Ahí encontrarás con claridad dónde mantener, dónde ajustar y dónde empezar a actuar con mayor intención.
                    </p>
                </div>

                <div className="pdf-domains-grid">
                    {[...domainScores]
                        .sort((a, b) => b.score - a.score)
                        .map((score) => {
                            const style = DOMAIN_STYLES[score.id] || { color: '#ddbe3d' };
                            const isCritical = score.score === minScore;

                            return (
                                <div key={score.id} className="pdf-domain-card" style={{ borderLeft: `8px solid #d1d5db` }}>
                                    <div className="pdf-domain-header">
                                        <div className="pdf-domain-title" style={{ color: '#4b5563' }}>
                                            {getDomainIcon(score.id)}
                                            <span>Dominio {score.domain}</span>
                                        </div>
                                        <div className="pdf-domain-tag">{score.interpretation}</div>
                                    </div>

                                    {isCritical && (
                                        <div className="pdf-critical-badge">
                                            <AlertCircle size={12} /> REQUIERE ATENCIÓN
                                        </div>
                                    )}

                                    <div className="pdf-domain-score-row">
                                        <div className="pdf-score-bar-bg">
                                            <div 
                                                className="pdf-score-bar-fill" 
                                                style={{ width: `${(score.score / 70) * 100}%`, background: style.color }}
                                            />
                                        </div>
                                        <span className="pdf-score-text">{score.score} pts</span>
                                    </div>

                                    <p className="pdf-domain-desc">{score.definition}</p>
                                </div>
                            );
                        })}
                </div>

                <div className="pdf-important-note">
                    <div className="pdf-note-text">
                        <strong>NOTA IMPORTANTE:</strong> Este autodiagnóstico es una herramienta de reflexión inicial. 
                        Los resultados reflejan tu percepción actual en cada dominio y sirven como base para tu Plan de Acción personalizado.
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                    Si quieres más información o acompañamiento ingresa a <span data-pdf-link="https://www.autenticos.co/" style={{ fontWeight: 'bold', color: '#00121d' }}>www.autenticos.co</span> o escríbenos a <span data-pdf-link="mailto:contacto@autenticos.co" style={{ fontWeight: 'bold', color: '#00121d' }}>contacto@autenticos.co</span>
                </div>

                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>
        </div>
    );
});

export default FascinantesReportTemplate;
