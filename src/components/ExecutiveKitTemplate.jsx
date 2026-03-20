import React from 'react';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import './ExecutiveKitTemplate.css';

const ExecutiveKitTemplate = ({ data, type, name }) => {
    if (!data) return null;

    const weeks = ['week1', 'week2', 'week3', 'week4'];
    const coinImage = `/eneatipo-${type}.png`;

    // Helper to render watermark
    const Watermark = ({ isCover = false }) => (
        <div className="kit-watermark">
            <img
                src={isCover ? "/eneagrama_gold.png" : "/Circulo_Eneagrama_dorado.png"}
                alt="Watermark"
            />
        </div>
    );

    // Helper to render page number
    const PageNumber = ({ num }) => (
        <div className="kit-page-number">
            {num}
        </div>
    );

    // Helper to render header banner
    const HeaderBanner = () => (
        <div className="kit-header-banner">
            <img src="/Eneagrama_banner_05.png" alt="Header Banner" />
        </div>
    );

    // Helper to render background image based on triad
    const getTriadBackground = (type) => {
        const t = parseInt(type);
        if ([8, 9, 1].includes(t)) return '/Fondo-rojo.png';
        if ([2, 3, 4].includes(t)) return '/Fondo-verde.png';
        if ([5, 6, 7].includes(t)) return '/Fondo-azul.png';
        return '/Fondo-rojo.png';
    };

    return (
        <div className="kit-container" id="executive-kit-root">
            {/* 1. PORTADA */}
            <div className="kit-page kit-page-cover">
                <div
                    className="kit-cover-full-background"
                    style={{ backgroundImage: `url(${getTriadBackground(type)})` }}
                ></div>
                <div className="kit-cover-content">
                    <div className="kit-cover-header-group">
                        <p className="kit-serie-title">SERIE DE ARQUETIPOS DE LIDERAZGO</p>
                        <div className="kit-gold-line"></div>
                        <p className="kit-cover-pretitle">PLAN DE ACCIÓN</p>
                    </div>

                    <div className="kit-cover-title-group">
                        <h1 className="kit-cover-type">{data.subtitle || `ENEATIPO ${type}`}</h1>
                        <h2 className="kit-cover-role">{data.roleName}</h2>

                        <div className="kit-tagline-wrapper">
                            <div className="kit-gold-line small"></div>
                            <h3 className="kit-cover-tagline">{data.tagline || data.title}</h3>
                            <div className="kit-gold-line small"></div>
                        </div>
                    </div>

                    <div className="kit-cover-coin-container-wrapper">
                        <Watermark isCover={true} />
                        <div className="kit-cover-coin-shadow">
                            <div className="kit-cover-coin-container">
                                <img src={coinImage} alt={`Eneatipo ${type}`} className="kit-cover-coin" />
                            </div>
                        </div>
                    </div>

                    <div className="kit-cover-bottom-group">
                        <div className="kit-cover-manual-section">
                            <p className="kit-cover-manual">Manual estratégico de liderazgo</p>
                            <div className="kit-manual-details">
                                <p>Modelo: Eneagrama aplicado</p>
                                <p>Implementación: 30 días</p>
                            </div>
                        </div>

                        <div className="kit-cover-footer-new">
                            <div className="kit-footer-left">
                                ARCHIVO <span className="kit-file-number">0{type}/09</span>
                            </div>
                            <div className="kit-footer-center">
                                <img src="/Logo-Blanco.png" alt="Logo Auténticos" />
                            </div>
                            <div className="kit-footer-right">
                                <div className="kit-confidential-lines">
                                    <span>DOCUMENTO</span>
                                    <span>CONFIDENCIAL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PERFIL GENERAL */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Perfil general</h2>

                {data.summary.generalProfile && (
                    <div className="kit-profile-general">
                        <p>{data.summary.generalProfile}</p>
                        {data.summary.highlights ? (
                            <div className="kit-profile-highlight">
                                {data.summary.highlights.map((h, i) => <p key={i}>{h}</p>)}
                            </div>
                        ) : (
                            <div className="kit-profile-highlight">
                                <p>Donde otros dudan, el {type} actúa.</p>
                                <p>Donde otros evitan el conflicto, el {type} interviene.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="kit-dashboard-grid">
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Estilo de liderazgo dominante:</span><br />
                            <span className="kit-card-value">{data.summary.style}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Fortaleza estratégica principal:</span><br />
                            <span className="kit-card-value">{data.summary.strength}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Punto ciego crítico:</span><br />
                            <span className="kit-card-value">{data.summary.blindspot}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Riesgo bajo presión:</span><br />
                            <span className="kit-card-value">{data.summary.risk}</span>
                        </p>
                    </div>
                </div>
                <div className="kit-evolution-block">
                    <span className="kit-evolution-subtitle" style={{ textTransform: 'none' }}>Clave de evolución</span>
                    <p className="kit-evolution-text">{data.summary.evolutionaryKey}</p>
                </div>


                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={2} />
            </div>

            {/* 3. TU ESTILO DE LIDERAZGO EN CONTEXTO EMPRESARIAL */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Tu estilo de liderazgo en contexto empresarial</h2>
                <div className="kit-text-block">
                    {data.leadershipContext?.paragraphs ? (
                        data.leadershipContext.paragraphs.map((p, i) => <p key={i}>{p}</p>)
                    ) : (
                        <>
                            <p>{data.profile.text}</p>
                            <p>Como líder de alto nivel, su capacidad para orquestar recursos y personas depende de la integración de sus motivaciones profundas con las demandas del entorno.</p>
                        </>
                    )}
                </div>

                {data.summary.maturityLevels && (
                    <div className="kit-maturity-block" style={{ marginTop: '30px' }}>
                        <h3 style={{ marginBottom: '12px' }}>Nivel de madurez del perfil</h3>
                        <div className="kit-maturity-levels">
                            {data.summary.maturityLevels.map((level, i) => (
                                <div key={i} className="kit-maturity-item" style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
                                    <span style={{ color: '#ddbe3d', fontWeight: 700 }}>•</span> {level}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={3} />
            </div>

            {/* 4. IMPACTO EN TU EQUIPO */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Impacto en tus equipos</h2>

                {data.impact ? (
                    <div className="kit-impact-sections">
                        <div className="kit-impact-box">
                            <h4 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={22} color="#ddbe3d" />
                                Comportamientos frecuentes
                            </h4>
                            <ul>
                                {data.impact.behaviors.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                        <div className="kit-impact-box">
                            <h4 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={22} color="#ddbe3d" />
                                Impacto positivo
                            </h4>
                            <ul>
                                {data.impact.positive.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div className="kit-impact-box">
                            <h4 style={{ textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={22} color="#ddbe3d" />
                                Riesgo potencial
                            </h4>
                            <ul>
                                {data.impact.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                        <p className="kit-impact-footer">
                            {data.impact.footer ? (
                                data.impact.footer.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i < data.impact.footer.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <>
                                    Un liderazgo fuerte es inspirador<br />
                                    cuando equilibra firmeza con apertura.
                                </>
                            )}
                        </p>
                    </div>
                ) : (
                    <table className="kit-table">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Impacto</th>
                                <th>Beneficio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.teamImpact.map((item, idx) => (
                                <tr key={idx}>
                                    <td><strong>{item.area}</strong></td>
                                    <td>{item.impact}</td>
                                    <td>{item.benefit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={4} />
            </div>

            {/* 5. RIESGO ORGANIZACIONAL SI NO EVOLUCIONAS */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Riesgo organizacional si no evolucionas</h2>
                <div className="kit-checklist" style={{ marginTop: '30px' }}>
                    {(data.orgRiskExtended?.items || data.orgRisk).map((risk, idx) => (
                        <div key={idx} className="kit-checklist-item">
                            <div className="kit-checkbox" style={{ background: '#ddbe3d' }}></div>
                            <p style={{ margin: 0 }}>{risk}</p>
                        </div>
                    ))}
                </div>
                {data.orgRiskExtended?.closing && (
                    <div className="kit-quote-block" style={{ marginTop: '40px' }}>
                        <p className="kit-quote-text" style={{ fontSize: '1.1rem' }}>{data.orgRiskExtended.closing}</p>
                    </div>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={5} />
            </div>

            {/* 6. PLAN DE IMPLEMENTACIÓN – SEMANA 1 & 2 */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#002d44', textTransform: 'none' }}>
                    Plan de implementación en 30 días
                </h2>

                <div className="kit-weeks-split">
                    {/* SEMANA 1 */}
                    <div className="kit-week-section">
                        <div className="kit-week-container" style={{ marginBottom: '5px' }}>
                            <div className="kit-week-number" style={{ textTransform: 'none' }}>Semana 1</div>
                            <h3 className="kit-week-title-main" style={{ textTransform: 'none' }}>{data.plan.week1.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong style={{ color: '#ddbe3d' }}>Enfoque:</strong> {data.plan.week1.focus}</p>
                        <div className="kit-action-list">
                            <ul className="kit-checklist">
                                {data.plan.week1.tasks.map((task, idx) => (
                                    <li key={idx} className="kit-checklist-item" style={{ marginBottom: '8px' }}>
                                        <div className="kit-checkbox"></div>
                                        <p style={{ margin: 0 }}>{task}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="kit-metric-box" style={{ marginTop: '10px' }}>
                            <span className="kit-metric-label">Indicador:</span>
                            <div className="kit-metric-value">{data.plan.week1.metric}</div>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: '#eee', margin: '20px 0' }}></div>

                    {/* SEMANA 2 */}
                    <div className="kit-week-section">
                        <div className="kit-week-container" style={{ marginBottom: '5px' }}>
                            <div className="kit-week-number" style={{ textTransform: 'none' }}>Semana 2</div>
                            <h3 className="kit-week-title-main" style={{ textTransform: 'none' }}>{data.plan.week2.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong style={{ color: '#ddbe3d' }}>Enfoque:</strong> {data.plan.week2.focus}</p>
                        <div className="kit-action-list">
                            <ul className="kit-checklist">
                                {data.plan.week2.tasks.map((task, idx) => (
                                    <li key={idx} className="kit-checklist-item" style={{ marginBottom: '8px' }}>
                                        <div className="kit-checkbox"></div>
                                        <p style={{ margin: 0 }}>{task}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="kit-metric-box" style={{ marginTop: '10px' }}>
                            <span className="kit-metric-label">Indicador:</span>
                            <div className="kit-metric-value">{data.plan.week2.metric}</div>
                        </div>
                    </div>
                </div>

                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={6} />
            </div>

            {/* 7. PLAN DE IMPLEMENTACIÓN – SEMANA 3 & 4 */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />

                <div className="kit-weeks-split" style={{ marginTop: '10mm' }}>
                    {/* SEMANA 3 */}
                    <div className="kit-week-section">
                        <div className="kit-week-container" style={{ marginBottom: '5px' }}>
                            <div className="kit-week-number" style={{ textTransform: 'none' }}>Semana 3</div>
                            <h3 className="kit-week-title-main" style={{ textTransform: 'none' }}>{data.plan.week3.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong style={{ color: '#ddbe3d' }}>Enfoque:</strong> {data.plan.week3.focus}</p>
                        <div className="kit-action-list">
                            <ul className="kit-checklist">
                                {data.plan.week3.tasks.map((task, idx) => (
                                    <li key={idx} className="kit-checklist-item" style={{ marginBottom: '8px' }}>
                                        <div className="kit-checkbox"></div>
                                        <p style={{ margin: 0 }}>{task}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="kit-metric-box" style={{ marginTop: '10px' }}>
                            <span className="kit-metric-label">Indicador:</span>
                            <div className="kit-metric-value">{data.plan.week3.metric}</div>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: '#eee', margin: '20px 0' }}></div>

                    {/* SEMANA 4 */}
                    <div className="kit-week-section">
                        <div className="kit-week-container" style={{ marginBottom: '5px' }}>
                            <div className="kit-week-number" style={{ textTransform: 'none' }}>Semana 4</div>
                            <h3 className="kit-week-title-main" style={{ textTransform: 'none' }}>{data.plan.week4.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong style={{ color: '#ddbe3d' }}>Enfoque:</strong> {data.plan.week4.focus}</p>
                        <div className="kit-action-list">
                            <ul className="kit-checklist">
                                {data.plan.week4.tasks.map((task, idx) => (
                                    <li key={idx} className="kit-checklist-item" style={{ marginBottom: '8px' }}>
                                        <div className="kit-checkbox"></div>
                                        <p style={{ margin: 0 }}>{task}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="kit-metric-box" style={{ marginTop: '10px' }}>
                            <span className="kit-metric-label">Indicador:</span>
                            <div className="kit-metric-value">{data.plan.week4.metric}</div>
                        </div>
                    </div>
                </div>

                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={7} />
            </div>

            {/* 10. MATRIZ EJECUTIVA DE TOMA DE DECISIONES */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Matriz ejecutiva de toma de decisiones</h2>

                {data.decisionMatrixExtended ? (
                    <div className="kit-decision-extended">
                        <p style={{ marginBottom: '25px' }}>Antes de decidir:</p>
                        <ul className="kit-checklist">
                            {data.decisionMatrixExtended.questions.map((q, i) => (
                                <li key={i} className="kit-checklist-item">
                                    <div className="kit-checkbox"></div>
                                    <p style={{ margin: 0 }}>{q}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="kit-metric-box" style={{ marginTop: '50px' }}>
                            <span className="kit-metric-label">Clave de liderazgo:</span>
                            <p style={{ margin: '10px 0 0', fontWeight: 700 }}>{data.decisionMatrixExtended.rule}</p>
                        </div>
                    </div>
                ) : (
                    <table className="kit-table">
                        <thead>
                            <tr>
                                <th>Criterio</th>
                                <th>Peso</th>
                                <th>Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.decisionMatrix.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.criteria}</td>
                                    <td>{item.weight}</td>
                                    <td>{item.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={8} />
            </div>

            {/* 11. PROTOCOLO BAJO PRESIÓN */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Protocolo bajo presión</h2>

                {data.pressureProtocolExtended ? (
                    <div className="kit-pressure-extended">
                        <div className="kit-impact-box">
                            <h4 style={{ textTransform: 'none' }}>Señales de alerta</h4>
                            <ul>
                                {data.pressureProtocolExtended.alerts.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                        <div className="kit-evolution-block" style={{ margin: '25px 0' }}>
                            <span className="kit-evolution-subtitle" style={{ textTransform: 'none' }}>Comportamiento automático</span>
                            <p className="kit-evolution-text" style={{ color: '#e74c3c' }}>{data.pressureProtocolExtended.automaticBehavior}</p>
                        </div>
                        <div className="kit-action-list">
                            <h4>Intervención en 3 pasos:</h4>
                            <div className="kit-step-list">
                                {data.pressureProtocolExtended.intervention.map((step, i) => (
                                    <div key={i} className="kit-step-item">
                                        <div className="kit-step-number">{i + 1}</div>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="kit-impact-footer" style={{ marginTop: '30px' }}>{data.pressureProtocolExtended.closing}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                        {data.pressureProtocol.map((item, idx) => (
                            <div key={idx} className="kit-protocol-item">
                                <div className="kit-protocol-label">{indexToLabel(idx)}</div>
                                <div>
                                    <h4 className="kit-protocol-phase">{item.phase}</h4>
                                    <p className="kit-protocol-action">{item.action}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={9} />
            </div>

            {/* 12. GUÍA PARA CONVERSACIONES DIFÍCILES */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Guía para conversaciones difíciles</h2>

                {data.conversationsGuide ? (
                    <div className="kit-conversations-extended">
                        <div className="kit-action-list">
                            <h4>Estructura recomendada:</h4>
                            <div className="kit-step-list">
                                {data.conversationsGuide.structure.map((step, i) => (
                                    <div key={i} className="kit-step-item">
                                        <div className="kit-step-number">{i + 1}</div>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="kit-impact-box" style={{ marginTop: '30px', borderColor: '#e74c3c' }}>
                            <h4 style={{ color: '#e74c3c', textTransform: 'none' }}>Evitar:</h4>
                            <ul>
                                {data.conversationsGuide.avoid.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                        <p className="kit-impact-footer" style={{ marginTop: '30px' }}>{data.conversationsGuide.closing}</p>
                    </div>
                ) : (
                    <div style={{ marginTop: '50px' }}>
                        {data.conversations.map((step, idx) => (
                            <div key={idx} className="kit-checklist-item" style={{ marginBottom: '40px' }}>
                                <div className="kit-step-number">{idx + 1}</div>
                                <p style={{ margin: 0, fontSize: '1.1rem' }}>{step}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={10} />
            </div>

            {/* 13. CHECKLIST ANTI-SABOTAJE */}
            <div className="kit-page kit-page-dark">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Checklist anti-sabotaje</h2>
                <div className="kit-checklist" style={{ marginTop: '60px' }}>
                    {(data.antiSabotageExtended || data.antiSabotage).map((item, idx) => (
                        <div key={idx} className="kit-checklist-item" style={{ marginBottom: '30px' }}>
                            <div className="kit-checkbox"></div>
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>{item}</p>
                        </div>
                    ))}
                </div>


                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={11} />
            </div>

            {/* 14. PLAN DE CRECIMIENTO – 6 MESES */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ textTransform: 'none' }}>Plan de crecimiento – 6 meses</h2>

                {data.growthPlanExtended ? (
                    <div className="kit-growth-extended">
                        <div className="kit-timeline">
                            {data.growthPlanExtended.phases.map((item, idx) => (
                                <div key={idx} className="kit-timeline-item">
                                    <div className="kit-timeline-dot"></div>
                                    <h4 style={{ margin: '0 0 5px', color: '#ddbe3d' }}>{item.t}</h4>
                                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{item.goal}</p>
                                </div>
                            ))}
                        </div>
                        <div className="kit-impact-box" style={{ marginTop: '50px', borderColor: '#27ae60' }}>
                            <h4 style={{ color: '#27ae60', textTransform: 'none' }}>Meta:</h4>
                            <p style={{ margin: '10px 0 0', fontWeight: 700, fontSize: '1.2rem', color: '#27ae60' }}>{data.growthPlanExtended.meta}</p>
                        </div>

                        {data.evolutionSignals && (
                            <div className="kit-evolution-signals" style={{ marginTop: '40px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '30px' }}>
                                <h3 style={{ color: '#ddbe3d', marginBottom: '20px' }}>Señales de evolución real</h3>
                                <div className="kit-checklist">
                                    {data.evolutionSignals.map((signal, idx) => (
                                        <div key={idx} className="kit-checklist-item" style={{ marginBottom: '15px' }}>
                                            <div className="kit-checkbox" style={{ background: '#ddbe3d' }}></div>
                                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{signal}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="kit-timeline">
                        {data.growthTimeline?.map((item, idx) => (
                            <div key={idx} className="kit-timeline-item">
                                <div className="kit-timeline-dot"></div>
                                <h4 style={{ margin: '0 0 5px', color: '#ddbe3d' }}>{item.t}</h4>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{item.goal}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={12} />
            </div>

            {/* 15. INTEGRACIÓN */}
            <div className="kit-page" style={{ alignItems: 'center', textAlign: 'center' }}>
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ marginTop: '40mm', textTransform: 'none' }}>Integración</h2>
                <p style={{ fontStyle: 'italic', color: '#b89b2d', fontSize: '1.1rem', marginBottom: '30px' }}>Convertir conocimiento en conciencia</p>
                <div className="kit-text-block" style={{ textAlign: 'left', marginTop: '10px' }}>
                    <p style={{ marginBottom: '20px' }}>
                        Este informe no pretende darte respuestas definitivas.<br />
                        Su propósito es ayudarte a <strong>ver con mayor claridad.</strong>
                    </p>
                    <p style={{ marginBottom: '20px' }}>
                        El Eneagrama revela patrones:<br />
                        la forma en que piensas, decides y reaccionas ante el mundo.
                    </p>
                    <p style={{ marginBottom: '20px' }}>
                        Comprenderlos es el primer paso.<br />
                        Pero la verdadera transformación ocurre cuando esa comprensión se convierte en <strong>observación consciente y práctica diaria.</strong>
                    </p>
                    <p style={{ marginBottom: '30px' }}>
                        Durante los próximos días tienes una oportunidad:<br />
                        <strong>Lo que decidas hacer con esta información es lo que realmente transforma tu liderazgo.</strong>
                    </p>
                </div>
                <div style={{ width: '60px', height: '2px', background: '#ddbe3d', margin: '20px auto' }}></div>
                <p style={{ fontStyle: 'italic', textAlign: 'center', fontSize: '1.05rem', color: '#002d44', marginTop: '20px', lineHeight: '1.8' }}>
                    El autoconocimiento no cambia tu vida.<br />
                    Las decisiones que tomas a partir de él, sí.
                </p>
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={13} />
            </div>
        </div>
    );
};

const indexToLabel = (idx) => {
    if (idx === 0) return "ALERTA";
    if (idx === 1) return "ACCIÓN";
    if (idx === 2) return "CIERRE";
    return "";
};

export default ExecutiveKitTemplate;
