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
                    <div style={{ width: '800px', height: '550px' }}>
                        <FascinantesRadar data={domainScores} height={550} radius="50%" isPDF={true} />
                    </div>
                </div>

                <div className="pdf-expert-card">
                    <h2 className="pdf-expert-name">{analysis.name}</h2>
                    <p className="pdf-expert-insight">{analysis.insight}</p>
                    
                    <div className="pdf-expert-grid">
                        <div className="pdf-expert-section">
                            <div className="pdf-expert-section-title">
                                <AlertCircle size={14} /> REQUIERE ATENCIÓN
                            </div>
                            <p className="pdf-expert-text">{analysis.critical}</p>
                        </div>
                        <div className="pdf-expert-section">
                            <div className="pdf-expert-section-title">
                                <Zap size={14} /> EXPLICACIÓN BREVE
                            </div>
                            <p className="pdf-expert-text">{analysis.explanation}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div className="pdf-expert-section-title">RECOMENDACIONES</div>
                        <ul className="pdf-expert-list">
                            {analysis.recommendations.map((rec, idx) => (
                                <li key={idx}>
                                    <span className="pdf-bullet">•</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* PAGE 2: DOMAIN CARDS */}
            <div className="pdf-page" id="pdf-page-2">
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

                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>
        </div>
    );
});

export default FascinantesReportTemplate;
