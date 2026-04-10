import React from 'react';
import './FascinantesActionPlanTemplate.css';

const FascinantesActionPlanTemplate = () => {
    const steps = [
        {
            title: "1. Aterriza el mapa (sin juicio)",
            desc: "Mira tus puntajes por dominio (Corporal, Mental, Emocional, Social, Espiritual, Financiero). Recuerda: esto no es un veredicto; es una fotografía de los últimos 90 días.",
            result: "Resultado esperado: claridad sin culpa."
        },
        {
            title: "2. Identifica “la fuga principal”",
            desc: "Elige solo 1 dominio como prioridad. El más bajo suele ser la fuga, pero si hay uno “medio” que te está costando mucho emocionalmente, ese puede ser la fuga real.",
            result: "Resultado esperado: un foco, no seis frentes."
        },
        {
            title: "3. Define el objetivo mínimo (7 días)",
            desc: "Pon un objetivo de una semana que sea pequeño, medible, realista y repetible. No busques la perfección, busca la constancia.",
            result: "Resultado esperado: éxito temprano y momentum."
        },
        {
            title: "4. Crea fricción o facilita",
            desc: "Diseña tu entorno: si quieres dejar un hábito alimenticio, aleja la tentación (fricción). Si quieres empezar a hacer ejercicio, deja la ropa lista (facilidad).",
            result: "Resultado esperado: diseño de comportamiento efectivo."
        },
        {
            title: "5. Notifica",
            desc: "Cuéntale a alguien que respetes lo que vas a hacer. El compromiso social aumenta drásticamente la probabilidad de que cumplas tu palabra.",
            result: "Resultado esperado: compromiso real y externo."
        },
        {
            title: "6. Mide diariamente",
            desc: "Lleva una bitácora de 30 segundos: ¿Cumplí mi objetivo ayer? ¿Cómo está mi energía hoy (1–5)? ¿Cómo está mi paz mental (1–5)?",
            result: "Resultado esperado: evidencia basada en datos, no en opiniones."
        },
        {
            title: "7. Revisión semanal (15 min)",
            desc: "Tres preguntas clave: 1. ¿Qué funcionó? 2. ¿Qué fue difícil y por qué? 3. ¿Qué ajusto para la próxima semana?",
            result: "Resultado esperado: mejora continua sin dramatismo."
        },
        {
            title: "8. Repite el autodiagnóstico",
            desc: "Vuelve a realizar este test cada 3 meses. No es para perseguir la perfección, sino para observar la tendencia de tu crecimiento integral.",
            result: "Resultado esperado: crecimiento medible y consciente."
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
                        <p className="fascinantes-kit-serie-title">PROGRAMA DE EQUILIBRIO INTEGRAL</p>
                        <div className="fascinantes-kit-gold-line"></div>
                        <p className="fascinantes-kit-cover-pretitle">PLAN DE ACCIÓN</p>
                    </div>

                    <div className="fascinantes-kit-cover-title-group">
                        <h1 className="fascinantes-kit-cover-type">FASCINANTES</h1>
                        <h2 className="fascinantes-kit-cover-role">Equilibrio & Vitalidad del Líder</h2>
                        <p className="fascinantes-kit-cover-tagline">
                            Asegurando el equilibrio integral para un liderazgo sostenible
                        </p>
                    </div>

                    <div className="fascinantes-kit-cover-radar-wrapper">
                        <div className="fascinantes-kit-cover-radar-shadow">
                            <img src="/Radar-2.png" alt="Fascinantes Radar" className="fascinantes-kit-cover-radar" />
                        </div>
                    </div>

                    <div className="fascinantes-kit-cover-bottom-group">
                        <p className="fascinantes-kit-cover-manual">Manual estratégico de implementación</p>
                        <div className="fascinantes-kit-manual-details">
                            <p>Modelo: 6 Dominios Vitales</p>
                            <p>Implementación: Paso a Paso</p>
                        </div>
                        
                        <div className="fascinantes-kit-cover-footer">
                            <div className="fascinantes-kit-footer-left">
                                DOCUMENTO ESTRATÉGICO
                            </div>
                            <div className="fascinantes-kit-footer-center">
                                <img src="/Logo-Blanco.png" alt="Logo Auténticos" />
                            </div>
                            <div className="fascinantes-kit-footer-right">
                                ARCHIVO CONFIDENCIAL
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PASOS 1-4 */}
            <div className="fascinantes-kit-page">
                <Watermark />
                <h2 className="fascinantes-kit-section-title">Tu Hoja de Ruta (Pasos 1 a 4)</h2>
                
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
                <PageNumber num={2} />
            </div>

            {/* 3. PASOS 5-8 */}
            <div className="fascinantes-kit-page">
                <Watermark />
                <h2 className="fascinantes-kit-section-title">Tu Hoja de Ruta (Pasos 5 a 8)</h2>
                
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

                <div className="fascinantes-kit-page-integration" style={{ marginTop: 'auto', paddingBottom: '30mm' }}>
                    <p style={{ fontStyle: 'italic', textAlign: 'center', color: '#002d44', lineHeight: '1.6' }}>
                        "El autoconocimiento no cambia tu vida.<br />
                        Las decisiones que tomas a partir de él, sí."
                    </p>
                </div>

                <div className="fascinantes-kit-page-footer">
                    <img src="/logo-azul.png" alt="Logo Auténticos" />
                </div>
                <PageNumber num={3} />
            </div>
        </div>
    );
};

export default FascinantesActionPlanTemplate;
