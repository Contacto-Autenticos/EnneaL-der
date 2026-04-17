import React from 'react';
import './FascinantesActionPlanTemplate.css';

const FascinantesActionPlanTemplate = () => {
    const steps = [
        {
            title: "1. Documenta tu estado actual",
            desc: "Analiza tus resultados en los seis dominios: Corporal, Mental, Emocional, Social, Espiritual y Financiero. Considera estos datos como una fotografía técnica de tus últimos 90 días, no como un juicio de valor.",
            result: "La claridad de los datos elimina el peso de la culpa y permite la acción."
        },
        {
            title: "2. Identifica tu fuga de energía",
            desc: "Elige un solo dominio como prioridad absoluta. El enfoque es tu recurso más escaso; busca aquel punto que, aunque no tenga el puntaje más bajo, hoy te genera el mayor desgaste emocional.",
            result: "Resolver una sola fuga es más efectivo que intentar sostener seis frentes simultáneos."
        },
        {
            title: "3. Establece el objetivo mínimo (7 días)",
            desc: "Define una acción para esta semana que sea pequeña, medible y, sobre todo, repetible. La prioridad aquí no es la intensidad, sino consolidar el hábito.",
            result: "El éxito temprano genera el impulso necesario para los cambios de largo plazo."
        },
        {
            title: "4. Ajusta las condiciones de tu entorno",
            desc: "Modifica tu espacio para que la disciplina sea sencilla. Crea obstáculos para los hábitos que quieres dejar y facilita el acceso a las acciones que quieres integrar.",
            result: "Un entorno bien diseñado reduce la dependencia de la fuerza de voluntad."
        },
        {
            title: "5. Establece un compromiso externo",
            desc: "Comunica tu objetivo a una persona cuya opinión respetes. El compromiso público aumenta la probabilidad de cumplimiento y rompe el aislamiento del líder.",
            result: "La transparencia con terceros refuerza la integridad personal."
        },
        {
            title: "6. Ejecuta una medición diaria",
            desc: "Lleva un registro rápido de 30 segundos cada noche. Evalúa si cumpliste tu objetivo y califica tu nivel de energía y paz mental en una escala de 1 a 5.",
            result: "Gestionar con datos evita que las opiniones o el cansancio distorsionen tu progreso."
        },
        {
            title: "7. Realiza una auditoría semanal",
            desc: "Dedica 15 minutos a revisar tres puntos: qué funcionó, qué dificultades surgieron y qué ajustes aplicarás la próxima semana.",
            result: "La mejora continua se basa en ajustes tácticos constantes, no en cambios drásticos."
        },
        {
            title: "8. Evalúa la tendencia de crecimiento",
            desc: "Repite el autodiagnóstico integral cada tres meses. El propósito es observar la trayectoria de tus indicadores y recalibrar tu estrategia de vida.",
            result: "El crecimiento consciente requiere una revisión periódica del rumbo."
        }
    ];

    const Watermark = () => (
        <div className="fascinantes-kit-watermark">
            <img src="/Circulo_Eneagrama_dorado.png" alt="Watermark" />
        </div>
    );

    const PageNumber = ({ num }) => (
        <div className="fascinantes-kit-page-number">{num}</div>
    );

    return (
        <div className="fascinantes-kit-container" id="fascinantes-action-plan-root">
            {/* 1. PORTADA */}
            <div className="fascinantes-kit-page fascinantes-kit-page-cover">
                <div 
                    className="fascinantes-kit-cover-full-background" 
                    style={{ backgroundImage: 'url(/Fondo-azul.png)' }}
                ></div>
                <div className="fascinantes-kit-cover-content">
                    <div className="fascinantes-kit-cover-header-group">
                        <p className="fascinantes-kit-serie-title">DESARROLLO INTEGRAL</p>
                        <div className="fascinantes-kit-gold-line"></div>
                        <p className="fascinantes-kit-cover-pretitle">RESULTADOS Y PLAN DE ACCIÓN</p>
                    </div>

                    <div className="fascinantes-kit-cover-title-group">
                        <h1 className="fascinantes-kit-cover-type">PROGRAMA FASCINANTES</h1>
                        <p className="fascinantes-kit-cover-tagline">
                            El liderazgo consciente no elimina el desequilibrio. Te entrena para responder mejor cuando aparece.
                        </p>
                    </div>

                    <div className="fascinantes-kit-cover-radar-wrapper">
                        <div className="fascinantes-kit-cover-radar-shadow">
                            <img src="/Radar-2.png" alt="Fascinantes Radar" className="fascinantes-kit-cover-radar" />
                        </div>
                    </div>

                    <div className="fascinantes-kit-cover-bottom-group">
                        <p className="fascinantes-kit-cover-manual">Manual de implementación paso a paso</p>
                        <div className="fascinantes-kit-manual-details">
                            <p>Modelo Dominios Fundamentales</p>
                            <p>Basado en la metodología MLT</p>
                        </div>
                        
                        <div className="fascinantes-kit-cover-footer">
                            <div className="fascinantes-kit-footer-left">
                                <p>Documento estratégico</p>
                            </div>
                            <div className="fascinantes-kit-footer-center">
                                <img src="/Logo-Blanco.png" alt="Logo Auténticos" />
                            </div>
                            <div className="fascinantes-kit-footer-right">
                                <p>Archivo confidencial</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. INTRODUCCIÓN */}
            <div className="fascinantes-kit-page fascinantes-kit-page-intro">
                <Watermark />
                <h1 className="fascinantes-kit-intro-title">TU MAPA DE TRANSFORMACIÓN</h1>
                <p className="fascinantes-kit-intro-subtitle">Guía práctica para un liderazgo en equilibrio integral</p>
                <div className="fascinantes-kit-gold-line" style={{ width: '100px', margin: '30px auto' }}></div>
                <div className="fascinantes-kit-intro-text">
                    <p style={{ marginBottom: '15px' }}>Este documento no es para hacer más cosas, es para mirar con más claridad cómo estás viviendo.</p>
                    <p style={{ marginBottom: '15px' }}>Lo que viste en tu diagnóstico no es casualidad. Es el resultado de decisiones, hábitos y prioridades que, con el tiempo, han ido moldeando tu forma de actuar, de relacionarte y de liderar.</p>
                    <p style={{ marginBottom: '15px' }}>Aquí no se trata de alcanzar un equilibrio perfecto. Se trata de desarrollar la capacidad de darte cuenta cuándo te estás desviando y hacer los ajustes necesarios a tiempo.</p>
                    <p style={{ marginBottom: '15px' }}>A partir de ahora el reto no es hacerlo mejor por impulso, sino hacerlo consciente. Elegir dónde enfocarte, qué sostener y qué cambiar, entendiendo que cada decisión impacta directamente la vida que estás construyendo.</p>
                    <p>Si te involucras de verdad en este proceso, no solo vas a generar cambios puntuales. Vas a empezar a dirigir con mayor intención la forma en la que vives y lideras.</p>
                </div>
                <div className="fascinantes-kit-page-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={2} />
            </div>

            {/* 2. PASOS 1-4 */}
            <div className="fascinantes-kit-page">
                <Watermark />
                <h2 className="fascinantes-kit-section-title" style={{ borderBottom: 'none', paddingBottom: '0', display: 'block' }}>
                    <span style={{ display: 'block', paddingBottom: '10px', marginBottom: '15px', borderBottom: '2px solid #ddbe3d' }}>FASE I:</span>
                    <span style={{ display: 'block', textTransform: 'none' }}>Análisis y foco estratégico</span>
                </h2>
                
                <div className="fascinantes-kit-steps-grid">
                    {steps.slice(0, 4).map((step, idx) => (
                        <div key={idx} className="fascinantes-kit-step-item">
                            <div className="fascinantes-kit-step-number">{idx + 1}</div>
                            <div className="fascinantes-kit-step-content">
                                <h3 className="fascinantes-kit-step-title">{step.title}</h3>
                                <p className="fascinantes-kit-step-desc">{step.desc}</p>
                                <div className="fascinantes-kit-expected-result">{step.result}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fascinantes-kit-page-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={3} />
            </div>

            {/* 3. PASOS 5-8 */}
            <div className="fascinantes-kit-page">
                <Watermark />
                <h2 className="fascinantes-kit-section-title" style={{ borderBottom: 'none', paddingBottom: '0', display: 'block' }}>
                    <span style={{ display: 'block', paddingBottom: '10px', marginBottom: '15px', borderBottom: '2px solid #ddbe3d' }}>FASE II:</span>
                    <span style={{ display: 'block', textTransform: 'none' }}>Sostenibilidad y ajuste</span>
                </h2>
                
                <div className="fascinantes-kit-steps-grid">
                    {steps.slice(4, 8).map((step, idx) => (
                        <div key={idx} className="fascinantes-kit-step-item">
                            <div className="fascinantes-kit-step-number">{idx + 5}</div>
                            <div className="fascinantes-kit-step-content">
                                <h3 className="fascinantes-kit-step-title">{step.title}</h3>
                                <p className="fascinantes-kit-step-desc">{step.desc}</p>
                                <div className="fascinantes-kit-expected-result">{step.result}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fascinantes-kit-page-integration" style={{ marginTop: 'auto', paddingBottom: '15mm' }}>
                    <p style={{ fontStyle: 'italic', textAlign: 'center', color: '#002d44', lineHeight: '1.6' }}>
                        "No se trata de saber más, sino de actuar mejor.<br />
                        Pequeñas decisiones, bien sostenidas, terminan cambiando el rumbo de tu vida."
                    </p>
                </div>

                <div className="fascinantes-kit-page-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={4} />
            </div>
        </div>
    );
};

export default FascinantesActionPlanTemplate;
