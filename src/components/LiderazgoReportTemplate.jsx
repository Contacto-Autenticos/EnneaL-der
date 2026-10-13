import React, { forwardRef } from 'react';
import { 
    Award, AlertTriangle, Lightbulb, 
    Layers, Quote, User, Target, MessageSquare, 
    Users, Star, CheckCircle2, Shield, Calendar, ArrowRight
} from 'lucide-react';
import LiderazgoSpeedometer from './LiderazgoSpeedometer';
import LiderazgoRadarChart from './LiderazgoRadarChart';
import './LiderazgoReportTemplate.css';

const DIMENSION_COLORS = {
    personal: '#0088ff',
    estrategico: '#ff9100',
    relacional: '#ddbe3d',
    multiplicador: '#00aa00',
    trascendente: '#aa00ff'
};

const getDimIcon = (id) => {
    switch(id) {
        case 'personal': return <User size={15} />;
        case 'estrategico': return <Target size={15} />;
        case 'relacional': return <MessageSquare size={15} />;
        case 'multiplicador': return <Users size={15} />;
        case 'trascendente': return <Star size={15} />;
        default: return <Shield size={15} />;
    }
};

const LiderazgoReportTemplate = forwardRef(({ results, recommendations = [], user = {} }, ref) => {
    if (!results || !results.level) return null;

    const overallValue = Math.round((results.totalScore / 275) * 5);
    const userName = (user.name || user.full_name || '').trim();
    const currentDate = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="liderazgo-pdf-template" ref={ref} id="liderazgo-report-template-root">
            {/* ══════════════════════════════════════════════════════════
                PAGE 0: PORTADA
            ══════════════════════════════════════════════════════════ */}
            <div className="pdf-page pdf-page-cover" id="l-pdf-page-0">
                <div className="l-pdf-cover-background"></div>

                <div className="l-pdf-cover-top">
                    <p className="l-pdf-serie-tag">AUTÉNTICOS · SERIE DE LIDERAZGO</p>
                    <div className="l-pdf-gold-divider"></div>
                    <p className="l-pdf-pretitle">DIAGNÓSTICO DE COMPETENCIAS</p>
                    <h1 className="l-pdf-cover-title">LIDERAZGO</h1>
                    
                    <div className="l-pdf-level-highlight-box">
                        <span className="l-pdf-level-pre">NIVEL ALCANZADO</span>
                        <h2 className="l-pdf-cover-level">{results.level.label.toUpperCase()}</h2>
                        <p className="l-pdf-cover-desc">"{results.level.desc}"</p>
                    </div>
                </div>

                <div className="l-pdf-cover-hero-center">
                    <div className="l-pdf-emblem-wrapper">
                        <img 
                            src={`/Faro blanco.png?v=${Date.now()}`}
                            alt="Faro Blanco" 
                            className="l-pdf-cover-emblem" 
                            crossOrigin="anonymous" 
                        />
                    </div>
                    <div className="l-pdf-cover-score-pill">
                        <span className="l-pdf-score-num">{results.totalScore}</span>
                        <span className="l-pdf-score-max">/ 275 PUNTOS TOTALES</span>
                    </div>
                </div>

                <div className="l-pdf-cover-bottom">
                    <div className="l-pdf-user-meta">
                        <p className="l-pdf-user-name">{userName ? userName.toUpperCase() : 'AUTODIAGNÓSTICO INDIVIDUAL'}</p>
                        <p className="l-pdf-date">{currentDate}</p>
                        <div className="l-pdf-gold-bar-small"></div>
                    </div>

                    <p className="l-pdf-methodology-note">
                        Modelo de Evaluación en 5 Dimensiones Fundamentales<br />
                        Metodología de Desarrollo de Líderes Extraordinarios
                    </p>

                    <div className="l-pdf-cover-footer-row">
                        <span className="l-pdf-confidential">DOCUMENTO CONFIDENCIAL</span>
                        <img 
                            src="/Logo-Blanco.png" 
                            alt="Auténticos" 
                            className="l-pdf-cover-logo" 
                            crossOrigin="anonymous" 
                        />
                        <span className="l-pdf-version">AUTÉNTICOS © {new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                PAGE 1: EVALUACIÓN GENERAL Y 5 DIMENSIONES
            ══════════════════════════════════════════════════════════ */}
            <div className="pdf-page" id="l-pdf-page-1">
                <header className="pdf-header">
                    <div className="l-pdf-header-category">DIAGNÓSTICO DE COMPETENCIAS DE LIDERAZGO</div>
                    <h1>EVALUACIÓN GENERAL Y DIMENSIONES</h1>
                    <p>Mapeo integral de capacidades, hábitos observables y efectividad</p>
                    <div className="l-pdf-header-line"></div>
                </header>

                {/* Nivel General Card */}
                <div className="l-pdf-general-score-card">
                    <div className="l-pdf-gauge-box">
                        <LiderazgoSpeedometer value={overallValue} showLabels={false} showInfo={false} />
                        <div className="l-pdf-gauge-pts">
                            <strong>{results.totalScore}</strong>
                            <span>PUNTOS TOTALES (DE 275)</span>
                        </div>
                    </div>
                    <div className="l-pdf-general-desc-box">
                        <span className="l-pdf-badge-gold">Nivel Consolidado</span>
                        <h3 style={{ color: results.level.color }}>{results.level.label}</h3>
                        <p className="l-pdf-level-long-desc">{results.level.desc}</p>
                        <div className="l-pdf-level-range-pill">
                            Rango evaluado: <strong>{results.level.min} a {results.level.max} pts</strong>
                        </div>
                    </div>
                </div>

                {/* Sección de Dimensiones */}
                <h2 className="pdf-section-title">
                    <Layers className="pdf-section-icon" size={20} /> Desglose por Dimensión
                </h2>

                <div className="l-pdf-dim-grid-layout">
                    {/* Radar Chart */}
                    <div className="l-pdf-radar-wrapper">
                        <div className="l-pdf-radar-inner">
                            <LiderazgoRadarChart dimensions={results.allDimensions} />
                        </div>
                        <p className="l-pdf-radar-caption">Distribución poligonal en las 5 dimensiones</p>
                    </div>

                    {/* Dimension Cards */}
                    <div className="l-pdf-dim-cards-col">
                        {results.allDimensions.map((dim) => {
                            const color = DIMENSION_COLORS[dim.id] || '#ddbe3d';
                            const pct = Math.round((dim.score / 50) * 100);
                            return (
                                <div key={dim.id} className="l-pdf-dim-row-card">
                                    <div className="l-pdf-dim-header-row">
                                        <div className="l-pdf-dim-title-group">
                                            <span className="l-pdf-dim-dot" style={{ backgroundColor: color }}></span>
                                            <h4>{dim.name}</h4>
                                        </div>
                                        <div className="l-pdf-dim-score-badge">
                                            <strong>{dim.score}</strong> / 50 pts
                                        </div>
                                    </div>
                                    <p className="l-pdf-dim-subtext">{dim.subtext}</p>
                                    <div className="l-pdf-bar-track">
                                        <div 
                                            className="l-pdf-bar-fill" 
                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                        ></div>
                                    </div>
                                    <div className="l-pdf-dim-footer-row">
                                        <span className="l-pdf-dim-interp">{dim.interpretation?.label || 'Evaluado'}</span>
                                        <span className="l-pdf-dim-pct">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pdf-page-number">1</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" crossOrigin="anonymous" />
                </footer>
            </div>

            {/* ══════════════════════════════════════════════════════════
                PAGE 2: FORTALEZAS, ÁREAS CRÍTICAS Y RECOMENDACIONES
            ══════════════════════════════════════════════════════════ */}
            <div className="pdf-page" id="l-pdf-page-2">
                <header className="pdf-header">
                    <div className="l-pdf-header-category">DIAGNÓSTICO DE COMPETENCIAS DE LIDERAZGO</div>
                    <h1>MAPA ESTRATÉGICO Y RECOMENDACIONES</h1>
                    <p>Tus principales palancas de impacto y focos prioritarios de atención</p>
                    <div className="l-pdf-header-line"></div>
                </header>

                {/* Top 3 Fortalezas */}
                <h2 className="pdf-section-title">
                    <Award className="pdf-section-icon" size={20} /> Top 3 Fortalezas (Tus Mayores Palancas)
                </h2>
                <div className="l-pdf-strengths-grid">
                    {results.topStrengths.map((str, idx) => (
                        <div key={str.id} className="l-pdf-strength-card">
                            <div className="l-pdf-card-badge-num">#{idx + 1}</div>
                            <div className="l-pdf-strength-body">
                                <div className="l-pdf-strength-title-row">
                                    <div className="l-pdf-strength-name-with-icon">
                                        {getDimIcon(str.id)}
                                        <h4>{str.name}</h4>
                                    </div>
                                    <span className="l-pdf-strength-score">{str.score} / 50 pts</span>
                                </div>
                                <p className="l-pdf-strength-sub">{str.subtext}</p>
                                <p className="l-pdf-strength-desc">
                                    Pilar de alto rendimiento comprobado. Utiliza esta dimensión como base para generar credibilidad, ordenar procesos y guiar a tu equipo en momentos de incertidumbre.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Áreas Críticas */}
                <h2 className="pdf-section-title" style={{ marginTop: '20px' }}>
                    <AlertTriangle className="pdf-section-icon" style={{ color: '#ef4444' }} size={20} /> Áreas Críticas (Focos de Atención)
                </h2>
                <div className="l-pdf-risks-grid">
                    {results.topRisks.map((risk) => (
                        <div key={risk.id} className="l-pdf-risk-card">
                            <div className="l-pdf-risk-header">
                                <div className="l-pdf-risk-name-with-icon">
                                    {getDimIcon(risk.id)}
                                    <h4>{risk.name}</h4>
                                </div>
                                <span className="l-pdf-risk-badge">
                                    {risk.interpretation?.label || 'Atención prioritaria'} · {risk.score}/50 pts
                                </span>
                            </div>
                            <p className="l-pdf-risk-sub">{risk.subtext}</p>
                            <p className="l-pdf-risk-desc">
                                Presenta brechas de consistencia que pueden frenar tu impacto global. Sin una intervención intencional, esta área suele convertirse en un cuello de botella para tu liderazgo.
                            </p>
                        </div>
                    ))}
                </div>

                {/* Recomendaciones Prácticas */}
                <h2 className="pdf-section-title" style={{ marginTop: '20px' }}>
                    <Lightbulb className="pdf-section-icon" size={20} /> Recomendaciones Prácticas Inmediatas
                </h2>
                <div className="l-pdf-recs-container">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="l-pdf-rec-row">
                            <div className="l-pdf-rec-num">{i + 1}</div>
                            <div className="l-pdf-rec-text">
                                <p>{rec}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pdf-page-number">2</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" crossOrigin="anonymous" />
                </footer>
            </div>

            {/* ══════════════════════════════════════════════════════════
                PAGE 3: PLAN DE CRECIMIENTO PERSONALIZADO (90 DÍAS)
            ══════════════════════════════════════════════════════════ */}
            <div className="pdf-page" id="l-pdf-page-3">
                <header className="pdf-header">
                    <div className="l-pdf-header-category">SERIE DE ARQUETIPOS Y COMPETENCIAS</div>
                    <h1>PLAN DE ACCIÓN Y HOJA DE RUTA</h1>
                    <p>Estrategia de consolidación de 90 días para un liderazgo extraordinario</p>
                    <div className="l-pdf-header-line"></div>
                </header>

                <div className="l-pdf-plan-intro-box">
                    <p>
                        Basado en tu perfil de <strong>{results.level.label}</strong>, tu desarrollo no requiere cambios improvisados sino una secuencia estructurada y progresiva. Esta hoja de ruta organiza tu evolución en tres fases complementarias de 30 días:
                    </p>
                </div>

                {/* 3 Fases del Plan */}
                <div className="l-pdf-phases-container">
                    {/* Fase 1 */}
                    <div className="l-pdf-phase-card phase-1">
                        <div className="l-pdf-phase-header">
                            <div className="l-pdf-phase-badge">FASE 1 · DÍAS 1 AL 30</div>
                            <h3>Estabilización e Integridad Operativa</h3>
                        </div>
                        <div className="l-pdf-phase-content">
                            <div className="l-pdf-phase-focus">
                                <strong>Dimensión Foco:</strong> {results.topRisks[0]?.name || 'Área Crítica'}
                            </div>
                            <p className="l-pdf-phase-objective">
                                <strong>Objetivo:</strong> Reducir fricciones e inconsistencias operativas. Frenar las fugas de energía que desvían tu atención de lo estratégico hacia lo reactivo.
                            </p>
                            <ul className="l-pdf-phase-actions">
                                <li>Identificar los disparadores específicos donde se producen desalineaciones en esta dimensión.</li>
                                <li>Establecer un compromiso concreto de comportamiento diario medible en las primeras horas laborales.</li>
                                <li>Revisar semanalmente los avances e impedimentos detectados para ajustar el rumbo con agilidad.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Fase 2 */}
                    <div className="l-pdf-phase-card phase-2">
                        <div className="l-pdf-phase-header">
                            <div className="l-pdf-phase-badge">FASE 2 · DÍAS 31 AL 60</div>
                            <h3>Expansión y Multiplicación del Impacto</h3>
                        </div>
                        <div className="l-pdf-phase-content">
                            <div className="l-pdf-phase-focus">
                                <strong>Dimensión Foco:</strong> {results.topStrengths[0]?.name || 'Mayor Fortaleza'}
                            </div>
                            <p className="l-pdf-phase-objective">
                                <strong>Objetivo:</strong> Apalancar tus principales talentos para empoderar al equipo, descentralizar decisiones y elevar el estándar de ejecución colectiva.
                            </p>
                            <ul className="l-pdf-phase-actions">
                                <li>Diseñar mecanismos claros de delegación completa con autonomía y acompañamiento por objetivos.</li>
                                <li>Promover una cultura de seguridad psicológica donde las personas propongan e innoven sin temor al error.</li>
                                <li>Reconocer y visibilizar periódicamente los avances y aportes individuales y colectivos del equipo.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Fase 3 */}
                    <div className="l-pdf-phase-card phase-3">
                        <div className="l-pdf-phase-header">
                            <div className="l-pdf-phase-badge">FASE 3 · DÍAS 61 AL 90</div>
                            <h3>Trascendencia, Propósito y Legado Sostenible</h3>
                        </div>
                        <div className="l-pdf-phase-content">
                            <div className="l-pdf-phase-focus">
                                <strong>Dimensión Foco:</strong> Liderazgo Consciente y Trascendente
                            </div>
                            <p className="l-pdf-phase-objective">
                                <strong>Objetivo:</strong> Consolidar coherencia profunda entre lo que piensas, sientes y ejecutas, proyectando un impacto positivo perdurable en tu entorno.
                            </p>
                            <ul className="l-pdf-phase-actions">
                                <li>Vincular las metas operativas con el propósito superior y el bienestar integral de las personas.</li>
                                <li>Institucionalizar hábitos de reflexión estratégica y toma de decisiones éticas a largo plazo.</li>
                                <li>Realizar una reevaluación trimestral para medir el progreso real alcanzado en los 90 días.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Cita de Cierre */}
                <div className="l-pdf-closing-quote-box">
                    <Quote className="l-pdf-quote-icon" size={24} />
                    <p className="l-pdf-quote-text">
                        “El verdadero liderazgo no se demuestra solo en la capacidad de obtener resultados, sino en quién te conviertes, cómo impactas a otros y qué legado construyes mientras los alcanzas.”
                    </p>
                </div>

                <div className="pdf-page-number">3</div>
                <footer className="pdf-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" crossOrigin="anonymous" />
                </footer>
            </div>
        </div>
    );
});

export default LiderazgoReportTemplate;
