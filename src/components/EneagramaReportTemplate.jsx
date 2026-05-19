import React, { forwardRef } from 'react';
import { Target, Layers, TrendingUp, Zap, Shield, Check, AlertTriangle, Activity, Wind, HelpCircle, Lightbulb } from 'lucide-react';
import { differentiationInfo } from '../data/differentiationInfo';
import './EneagramaReportTemplate.css';

const EneagramaReportTemplate = forwardRef(({ type, details, basicInfo, winner, rivals, user = {} }, ref) => {
    if (!type || !details || !winner) return null;

    const userName = user.name || '';
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="eneagrama-pdf-template" ref={ref}>
            {/* PAGE 0: COVER */}
            <div className="pdf-page" id="pdf-page-0" style={{
                backgroundImage: 'url("/Montañas 05.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px 40px',
                textAlign: 'center'
            }}>
                <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ddbe3d', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        RESULTADOS DEL ANÁLISIS AVANZADO
                    </p>
                    <div style={{ width: '80%', height: '1px', backgroundColor: '#ddbe3d', margin: '0 auto 25px auto', opacity: 0.5 }}></div>
                    <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', lineHeight: '1.1', margin: '0' }}>
                        PERFIL AUTÉNTICO<br />ENEATIPO {type}
                    </h1>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginTop: '15px', opacity: 0.9 }}>{winner.name}</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '40px 0' }}>
                    <img src={`/eneatipo-${type}.png`} alt={`Eneatipo ${type}`} style={{ width: '280px', height: 'auto' }} crossOrigin="anonymous" />
                </div>

                {(userName || date) && (
                    <div style={{ marginBottom: '20px', display: 'inline-block', width: '100%' }}>
                        {userName && <p style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>{userName}</p>}
                        {date && <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)', margin: '8px 0 0 0', fontWeight: '600' }}>{date}</p>}
                        
                        <div style={{ width: '60px', height: '2px', backgroundColor: '#ddbe3d', margin: '25px auto', opacity: 0.8 }}></div>
                    </div>
                )}

                <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '10px', marginTop: '0', lineHeight: '1.4' }}>
                        Metodología de Desarrollo Integral<br />basada en Eneagrama
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <img src="/Logo-Blanco.png" alt="Auténticos" style={{ height: '38px' }} />
                </div>
            </div>

            {/* PAGE 1: INTRO & MOTIVATIONS */}
            <div className="pdf-page" id="pdf-page-1">
                <header className="pdf-header">
                    <h1>COMPRENDIENDO TU ENEATIPO</h1>
                    <p>Eneatipo {type} - {winner.name}</p>
                </header>

                <div className="pdf-info-box">
                    <strong>Una breve descripción:</strong>
                    <p>{details.description}</p>
                </div>

                <div className="pdf-info-box" style={{ backgroundColor: '#f1f5f9', borderLeftColor: '#002d44' }}>
                    <strong>Frase interna que suele repetirse:</strong>
                    <p style={{ fontStyle: 'italic', fontSize: '16px' }}>"{details.phrase}"</p>
                </div>

                <h2 className="pdf-section-title">
                    <Target className="pdf-section-icon" size={24} /> Motivaciones Centrales
                </h2>
                
                <div className="pdf-grid-2">
                    <div className="pdf-card">
                        <h4>Miedo Básico</h4>
                        <p>{details.motivations.fear}</p>
                    </div>
                    <div className="pdf-card">
                        <h4>Deseo Básico</h4>
                        <p>{details.motivations.desire}</p>
                    </div>
                </div>
                
                <p className="pdf-text">{details.motivations.msg}</p>

                <div className="pdf-page-number">1</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 2: STRUCTURE & GROWTH */}
            <div className="pdf-page" id="pdf-page-2">
                <h2 className="pdf-section-title" style={{ marginTop: '0' }}>
                    <Layers className="pdf-section-icon" size={24} /> Tu Estructura
                </h2>
                
                <div className="pdf-card" style={{ marginBottom: '25px', padding: '0' }}>
                    <div className="pdf-triad-row" style={{ padding: '15px 20px' }}>
                        <div className="pdf-triad-label">Centro de Inteligencia:</div>
                        <div className="pdf-triad-value">{details.triads.center}</div>
                    </div>
                    <div className="pdf-triad-row" style={{ padding: '15px 20px' }}>
                        <div className="pdf-triad-label">Buscas:</div>
                        <div className="pdf-triad-value">{details.triads.seeking}</div>
                    </div>
                    <div className="pdf-triad-row" style={{ padding: '15px 20px' }}>
                        <div className="pdf-triad-label">Estrategia relacional:</div>
                        <div className="pdf-triad-value">{details.triads.social}</div>
                    </div>
                    <div className="pdf-triad-row" style={{ padding: '15px 20px' }}>
                        <div className="pdf-triad-label">Emoción base:</div>
                        <div className="pdf-triad-value">{details.triads.coping}</div>
                    </div>
                </div>
                
                <p className="pdf-text">{details.triads.desc}</p>

                <h2 className="pdf-section-title" style={{ marginTop: '40px' }}>
                    <TrendingUp className="pdf-section-icon" size={24} /> Dinámica de Crecimiento
                </h2>
                
                <ul className="pdf-list">
                    <li className="pdf-list-item">
                        <TrendingUp size={20} className="pdf-bullet-icon" style={{ color: '#2ECC71' }} />
                        <div>
                            {details.paths.growth.includes(':') ? (
                                <>
                                    <strong>{details.paths.growth.split(':')[0]}:</strong>
                                    {details.paths.growth.split(':')[1]}
                                </>
                            ) : details.paths.growth}
                        </div>
                    </li>
                    <li className="pdf-list-item">
                        <TrendingUp size={20} className="pdf-bullet-icon" style={{ color: '#E74C3C', transform: 'rotate(180deg)' }} />
                        <div>
                            {details.paths.stress.includes(':') ? (
                                <>
                                    <strong>{details.paths.stress.split(':')[0]}:</strong>
                                    {details.paths.stress.split(':')[1]}
                                </>
                            ) : details.paths.stress}
                        </div>
                    </li>
                </ul>
                
                <div className="pdf-info-box" style={{ backgroundColor: '#f8fafc', borderLeftColor: '#3498DB' }}>
                    <p>{details.paths.msg.includes(':') ? (
                        <>
                            <strong>{details.paths.msg.split(':')[0]}:</strong>
                            {details.paths.msg.split(':')[1]}
                        </>
                    ) : details.paths.msg}</p>
                </div>

                <div className="pdf-page-number">2</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 3: PATTERNS & IMPACT */}
            {(details.automaticPattern || details.bodyImpact) && (
                <div className="pdf-page" id="pdf-page-3">
                    {details.automaticPattern && (
                        <>
                            <h2 className="pdf-section-title" style={{ marginTop: '0' }}>
                                <Zap className="pdf-section-icon" size={24} /> Tu Patrón Automático en 5 Pasos
                            </h2>
                            
                            <div className="pdf-grid-2">
                                <div className="pdf-card">
                                    <h4 style={{ color: '#E74C3C' }}>Lo que más te activa:</h4>
                                    <ul className="pdf-list">
                                        {details.automaticPattern.activators.map((item, idx) => (
                                            <li key={idx} className="pdf-list-item" style={{ marginBottom: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E74C3C', marginTop: '7px', flexShrink: 0 }} />
                                                <span style={{ fontSize: '14px' }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pdf-card">
                                    <h4 style={{ color: '#3498DB' }}>Ante lo inesperado, sueles:</h4>
                                    <ul className="pdf-list">
                                        {details.automaticPattern.responses.map((item, idx) => (
                                            <li key={idx} className="pdf-list-item" style={{ marginBottom: '8px' }}>
                                                <Activity size={14} className="pdf-bullet-icon" style={{ color: '#3498DB', marginTop: '3px' }} />
                                                <span style={{ fontSize: '14px' }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}

                    {details.bodyImpact && (
                        <>
                            <h2 className="pdf-section-title">
                                <Wind className="pdf-section-icon" size={24} /> Impacto en el Cuerpo
                            </h2>
                            <p className="pdf-text">{details.bodyImpact.intro}</p>
                            
                            <div className="pdf-card">
                                <ul className="pdf-list" style={{ marginBottom: 0 }}>
                                    {details.bodyImpact.items.map((item, idx) => (
                                        <li key={idx} className="pdf-list-item">
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pdf-gold)', marginTop: '6px', flexShrink: 0 }} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    <div className="pdf-page-number">3</div>
                    <footer className="pdf-footer">
                        <img src="/logo-azul.png" alt="Logo" />
                    </footer>
                </div>
            )}

            {/* PAGE 4: LEADERSHIP & DIFFERENTIATION */}
            <div className="pdf-page" id="pdf-page-4">
                {details.leadershipStyle && (
                    <>
                        <h2 className="pdf-section-title" style={{ marginTop: '0' }}>
                            <Shield className="pdf-section-icon" size={24} /> Tu Estilo de Liderazgo
                        </h2>
                        
                        <div className="pdf-grid-2">
                            <div className="pdf-card">
                                <h4 style={{ color: '#2ECC71' }}>Fortalezas:</h4>
                                <ul className="pdf-list" style={{ marginBottom: 0 }}>
                                    {details.leadershipStyle.strengths?.map((item, idx) => (
                                        <li key={idx} className="pdf-list-item" style={{ marginBottom: '8px' }}>
                                            <Check size={16} className="pdf-bullet-icon" style={{ color: '#2ECC71' }} />
                                            <span style={{ fontSize: '14px' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pdf-card">
                                <h4 style={{ color: '#E74C3C' }}>Riesgos:</h4>
                                <ul className="pdf-list" style={{ marginBottom: 0 }}>
                                    {details.leadershipStyle.risks?.map((item, idx) => (
                                        <li key={idx} className="pdf-list-item" style={{ marginBottom: '8px' }}>
                                            <AlertTriangle size={16} className="pdf-bullet-icon" style={{ color: '#E74C3C' }} />
                                            <span style={{ fontSize: '14px' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {details.leadershipStyle.footer && (
                            <p className="pdf-text" style={{ fontStyle: 'italic', textAlign: 'center', marginBottom: '30px' }}>
                                {details.leadershipStyle.footer}
                            </p>
                        )}
                    </>
                )}
                
                {details.leadership && (
                    <>
                        <h2 className="pdf-section-title" style={{ marginTop: details.leadershipStyle ? '0' : '0' }}>
                            <Lightbulb className="pdf-section-icon" size={24} /> Consejos para el Liderazgo
                        </h2>
                        <ul className="pdf-list" style={{ marginBottom: '30px' }}>
                            {details.leadership.map((item, idx) => (
                                <li key={idx} className="pdf-list-item">
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--pdf-gold)', marginTop: '6px', flexShrink: 0 }} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {rivals && rivals.length > 0 && (
                    <>
                        <h2 className="pdf-section-title">
                            <HelpCircle className="pdf-section-icon" size={24} /> Análisis de Diferenciación
                        </h2>
                        <p className="pdf-text">
                            Es común que tu perfil muestre rasgos de otros eneatipos. Aquí te explicamos por qué NO eres los otros tipos que estuvieron cerca en tu puntaje:
                        </p>
                        
                        {rivals.map((rival) => (
                            <div key={rival.type} className="pdf-diff-card">
                                <div className="pdf-diff-header">
                                    <span className="pdf-diff-badge winner">T{type}</span>
                                    <span className="pdf-diff-vs">vs</span>
                                    <span className="pdf-diff-badge rival">T{rival.type}</span>
                                </div>
                                <h4 className="pdf-diff-title">¿Por qué no Eneatipo {rival.type}?</h4>
                                <p className="pdf-diff-text">
                                    {differentiationInfo[type]?.[rival.type] ||
                                        `Aunque compartes intensidad con el tipo ${rival.type}, tu motivación profunda de ${winner.name} prevalece.`}
                                </p>
                            </div>
                        ))}
                    </>
                )}

                <div className="pdf-page-number">4</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>
        </div>
    );
});

export default EneagramaReportTemplate;
