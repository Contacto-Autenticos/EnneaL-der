import React from 'react';
import './ExecutiveKitTemplate.css';

const ExecutiveKitTemplate = ({ data, type, name }) => {
    if (!data) return null;

    const weeks = ['week1', 'week2', 'week3', 'week4'];
    const coinImage = `/eneatipo-${type}.jpg`;

    // Helper to render watermark
    const Watermark = () => (
        <div className="kit-watermark">
            <img src="/Circulo_Eneagrama_dorado.png" alt="Watermark" />
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

    return (
        <div className="kit-container" id="executive-kit-root">
            {/* 1. PORTADA */}
            <div className="kit-page kit-page-cover">
                <Watermark />
                <div className="kit-cover-content">
                    <p className="kit-cover-pretitle">KIT EJECUTIVO DE ACCIÓN</p>
                    <div className="kit-cover-title-group">
                        <h1 className="kit-cover-type">{data.subtitle || `ENEATIPO ${type}`}</h1>
                        <h2 className="kit-cover-role">{data.roleName}</h2>
                    </div>
                    <h3 className="kit-cover-tagline">{data.tagline || data.title}</h3>

                    <div className="kit-cover-coin-container">
                        <img src={coinImage} alt={`Eneatipo ${type}`} className="kit-cover-coin" />
                    </div>

                    <div className="kit-cover-footer">
                        <p className="kit-cover-manual">{data.manualTitle || "Manual Ejecutivo de Implementación en Liderazgo"}</p>
                        <div className="kit-cover-divider"></div>
                        <p className="kit-cover-confidential">{data.confidentialLabel || "Informe confidencial – Uso profesional"}</p>
                    </div>

                    <div className="kit-page-footer-logo cover-logo">
                        <img src="/Logo-Blanco.png" alt="Logo Auténticos" />
                    </div>
                </div>
                <PageNumber num={1} />
            </div>

            {/* 2. RESUMEN EJECUTIVO */}
            <div className="kit-page">
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title">Resumen Ejecutivo</h2>

                {data.summary.generalProfile && (
                    <div className="kit-profile-general">
                        <h3>Perfil General</h3>
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
                            <span className="kit-card-label">Estilo de Liderazgo Dominante:</span><br />
                            <span className="kit-card-value">{data.summary.style}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Fortaleza Estratégica Principal:</span><br />
                            <span className="kit-card-value">{data.summary.strength}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Punto Ciego Crítico:</span><br />
                            <span className="kit-card-value">{data.summary.blindspot}</span>
                        </p>
                    </div>
                    <div className="kit-card">
                        <p>
                            <span className="kit-card-label">Riesgo Bajo Presión:</span><br />
                            <span className="kit-card-value">{data.summary.risk}</span>
                        </p>
                    </div>
                </div>
                <div className="kit-evolution-block">
                    <span className="kit-evolution-subtitle">Clave de Evolución</span>
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
                <h2 className="kit-section-title">Tu estilo de liderazgo en contexto empresarial</h2>
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
                        <h3>Nivel de Madurez del Perfil</h3>
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
                <h2 className="kit-section-title">Impacto en tu equipo</h2>

                {data.impact ? (
                    <div className="kit-impact-sections">
                        <div className="kit-impact-box">
                            <h4>Comportamientos Frecuentes</h4>
                            <ul>
                                {data.impact.behaviors.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                        <div className="kit-impact-box">
                            <h4>Impacto Positivo</h4>
                            <ul>
                                {data.impact.positive.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div className="kit-impact-box">
                            <h4>Riesgo Potencial</h4>
                            <ul>
                                {data.impact.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                        <p className="kit-impact-footer">Un liderazgo fuerte inspira cuando equilibra firmeza con apertura.</p>
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
                <h2 className="kit-section-title">Riesgo organizacional si no evolucionas</h2>
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
                <h2 className="kit-section-title" style={{ textAlign: 'center', marginBottom: '30px', color: '#002d44' }}>
                    Plan de implementación – 30 días
                </h2>

                <div className="kit-weeks-split">
                    {/* SEMANA 1 */}
                    <div className="kit-week-section">
                        <div className="kit-week-container" style={{ marginBottom: '5px' }}>
                            <div className="kit-week-number">Semana 1</div>
                            <h3 className="kit-week-title-main">{data.plan.week1.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong>Enfoque:</strong> {data.plan.week1.focus}</p>
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
                            <div className="kit-week-number">Semana 2</div>
                            <h3 className="kit-week-title-main">{data.plan.week2.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong>Enfoque:</strong> {data.plan.week2.focus}</p>
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
                            <div className="kit-week-number">Semana 3</div>
                            <h3 className="kit-week-title-main">{data.plan.week3.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong>Enfoque:</strong> {data.plan.week3.focus}</p>
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
                            <div className="kit-week-number">Semana 4</div>
                            <h3 className="kit-week-title-main">{data.plan.week4.title}</h3>
                        </div>
                        <p style={{ marginBottom: '10px' }}><strong>Enfoque:</strong> {data.plan.week4.focus}</p>
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
                <h2 className="kit-section-title">Matriz ejecutiva de toma de decisiones</h2>

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
                            <span className="kit-metric-label">Regla Ejecutiva:</span>
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
                <h2 className="kit-section-title">Protocolo bajo presión</h2>

                {data.pressureProtocolExtended ? (
                    <div className="kit-pressure-extended">
                        <div className="kit-impact-box">
                            <h4>Señales de Alerta</h4>
                            <ul>
                                {data.pressureProtocolExtended.alerts.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                        <div className="kit-evolution-block" style={{ margin: '25px 0' }}>
                            <span className="kit-evolution-subtitle">Comportamiento Automático</span>
                            <p className="kit-evolution-text" style={{ color: '#e74c3c' }}>{data.pressureProtocolExtended.automaticBehavior}</p>
                        </div>
                        <div className="kit-action-list">
                            <h4>Intervención en 3 Pasos:</h4>
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
                <h2 className="kit-section-title">Guía para conversaciones difíciles</h2>

                {data.conversationsGuide ? (
                    <div className="kit-conversations-extended">
                        <div className="kit-action-list">
                            <h4>Estructura Recomendada:</h4>
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
                            <h4 style={{ color: '#e74c3c' }}>Evitar:</h4>
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
                <h2 className="kit-section-title">Checklist Anti-Sabotaje</h2>
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
                <h2 className="kit-section-title">Plan de crecimiento – 6 meses</h2>

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
                        <div className="kit-metric-box" style={{ marginTop: '50px' }}>
                            <span className="kit-metric-label">Meta:</span>
                            <p style={{ margin: '10px 0 0', fontWeight: 700, fontSize: '1.2rem' }}>{data.growthPlanExtended.meta}</p>
                        </div>

                        {data.evolutionSignals && (
                            <div className="kit-evolution-signals" style={{ marginTop: '40px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '30px' }}>
                                <h3 style={{ color: '#ddbe3d', marginBottom: '20px' }}>Señales de Evolución Real</h3>
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

            {/* 15. CIERRE EJECUTIVO */}
            <div className="kit-page" style={{ alignItems: 'center', textAlign: 'center' }}>
                <HeaderBanner />
                <Watermark />
                <h2 className="kit-section-title" style={{ marginTop: '40mm' }}>Cierre Ejecutivo</h2>
                <div className="kit-text-block" style={{ textAlign: 'center' }}>
                    {data.closingExtended?.paragraphs ? (
                        data.closingExtended.paragraphs.map((p, i) => <p key={i} style={{ marginBottom: '20px', fontWeight: i % 2 === 1 ? 700 : 400 }}>{p}</p>)
                    ) : (
                        <p>Este informe es una herramienta viva. Su éxito depende de la aplicación consciente de estos marcos de trabajo en el día a día operativo.</p>
                    )}
                </div>
                <div style={{ width: '60px', height: '2px', background: '#ddbe3d', margin: '40px 0' }}></div>
                <div className="kit-signature-space">Certificación de Liderazgo Consciente</div>
                <div className="kit-page-footer-logo">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={13} />
            </div>
        </div >
    );
};

const indexToLabel = (idx) => {
    if (idx === 0) return "ALERTA";
    if (idx === 1) return "ACCIÓN";
    if (idx === 2) return "CIERRE";
    return "";
};

export default ExecutiveKitTemplate;
