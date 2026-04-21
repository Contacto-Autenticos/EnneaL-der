import React, { forwardRef } from 'react';
import { User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import FascinantesRadar from './FascinantesRadar';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
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

const FascinantesReportTemplate = forwardRef(({ domainScores, analysis, userAnswers = {}, hideQAPages = false, userName = '', date = '' }, ref) => {
    if (!domainScores || domainScores.length === 0 || !analysis) return null;
    const minScore = Math.min(...domainScores.map(s => s.score));
    const lowestDomainObj = domainScores.find(s => s.score === minScore) || domainScores[0];
    const totalScore = domainScores.reduce((sum, s) => sum + s.score, 0);

    const getLevel = (total) => {
        if(total >= 84 && total <= 151) return 1;
        if(total >= 152 && total <= 218) return 2;
        if(total >= 219 && total <= 285) return 3;
        if(total >= 286 && total <= 352) return 4;
        return 5;
    };
    const userLevel = getLevel(totalScore);

    const levelData = [
        { level: 1, color: '#cc0000', range: '84 a 151', status: 'Supervivencia: Alto riesgo de agotamiento o crisis en múltiples áreas. Urge intervención.' },
        { level: 2, color: '#ff9100', range: '152 a 218', status: 'Inestabilidad: Se vive de forma reactiva. Hay esfuerzos aislados, pero falta estructura.' },
        { level: 3, color: '#ffee00', range: '219 a 285', status: 'Funcional: La vida "funciona", pero hay áreas grises que frenan el potencial real.' },
        { level: 4, color: '#00ff00', range: '286 a 352', status: 'Desarrollo: Existe equilibrio y consciencia. El usuario tiene el control de su crecimiento.' },
        { level: 5, color: '#3b82f6', range: '353 a 420', status: 'Plenitud: Alta coherencia y maestría personal. Los dominios se potencian entre sí.' }
    ];

    const getScoreByDomain = (domainId) => {
        const s = domainScores.find(d => d.id === domainId);
        return s ? s.score : 0;
    };

    const LEVEL_READINGS = {
        1: {
            title: "Nivel 1: Supervivencia",
            color: "#cc0000",
            subtitle: '"Es momento de parar y respirar"',
            paragraphs: [
                "Estar aquí significa que el sistema está al límite. Sentimos que estamos apagando incendios todo el día y que nuestra energía se drena más rápido de lo que podemos recuperarla.",
                "En Auténticos sabemos que este nivel de agotamiento no es sostenible y que la crisis es un grito de auxilio de tu propio bienestar. No busques grandes transformaciones hoy; busca intervención.",
                "Necesitas identificar ese dominio que está drenando a los demás y ponerle un límite antes de que el motor se detenga."
            ],
            step: "Tu siguiente paso: Agenda una sesión de priorización inmediata con un profesional que pueda acompañarte en el proceso. El objetivo es estabilizar las fugas de energía antes de intentar avanzar."
        },
        2: {
            title: "Nivel 2: Inestabilidad",
            color: "#ff9100",
            subtitle: '"Salir del modo reactivo"',
            paragraphs: [
                "Vivir aquí es como pedalear con fuerza, pero sin una cadena bien ajustada: haces esfuerzos aislados, tienes chispazos de orden, pero te falta una estructura que te sostenga. Sientes que la vida te sucede y tú solo reaccionas a ella.",
                "Para nosotros, la inestabilidad es una señal de que necesitas método. El objetivo aquí no es hacer más cosas, sino empezar a ponerles un orden coherente. Deja de moverte por urgencia y empieza a moverte por intención."
            ],
            step: 'Tu siguiente paso: Define tu "Pilar Maestro". Elige un solo dominio para estructurar esta semana y deja que el resto se apoyen en él.'
        },
        3: {
            title: "Nivel 3: Funcional",
            color: "#ffee00",
            subtitle: '"Que lo bueno no sea enemigo de lo extraordinario"',
            paragraphs: [
                'Este es un nivel engañoso porque la vida "funciona". Cumples, produces, los resultados están ahí, pero en el fondo sabes que hay áreas grises que están frenando tu potencial real. Estás operando en automático.',
                'En Auténticos creemos que el estado funcional es una zona de confort que puede volverse peligrosa si te acomodas en ella. El reto aquí es identificar qué te falta para dar el salto de "estar bien" a "estar pleno".'
            ],
            step: 'Tu siguiente paso: Auditoría de "Áreas Grises". Vamos a identificar ese 20% de ajustes que liberará el 80% de tu potencial oculto.'
        },
        4: {
            title: "Nivel 4: Desarrollo",
            color: "#00ff00",
            subtitle: '"Dueño de tu propio crecimiento"',
            paragraphs: [
                "Aquí es donde la consciencia se vuelve una herramienta de gestión diaria. Tienes equilibrio, ves con claridad cómo tus decisiones afectan tus resultados y, lo más importante, sientes que tienes el control. Estás en un proceso de expansión constante.",
                "Para nosotros, este es el punto donde dejas de ser una víctima de las circunstancias y te conviertes en el arquitecto de tu realidad."
            ],
            step: "Tu siguiente paso: Escalamiento. Es momento de sistematizar tus hábitos para que este bienestar sea automático y no dependa solo de tu fuerza de voluntad."
        },
        5: {
            title: "Nivel 5: Plenitud",
            color: "#3b82f6",
            subtitle: '"La maestría de la coherencia"',
            paragraphs: [
                "Llegar aquí no significa que tu vida sea perfecta, sino que has alcanzado una alta coherencia entre lo que eres, lo que piensas y lo que haces. Es la maestría personal en su máxima expresión: tus dominios no solo están en equilibrio, sino que se potencian entre sí.",
                "En Auténticos celebramos este estado porque es desde aquí donde se construye un legado."
            ],
            step: "Tu siguiente paso: Trascendencia. ¿Cómo vas a usar esta claridad para potenciar a tu equipo o a tu entorno? Tu siguiente nivel es el liderazgo multiplicador."
        }
    };

    const currentReading = LEVEL_READINGS[userLevel] || LEVEL_READINGS[1];

    return (
        <div className="fascinantes-pdf-template" ref={ref}>
            {/* PAGE 0: COVER */}
            <div className="pdf-page" id="pdf-page-0" style={{
                backgroundImage: 'url("/Montañas 01.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px 40px',
                textAlign: 'center'
            }}>
                <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f2b705', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        RESULTADOS Y PLAN DE ACCIÓN
                    </p>
                    <div style={{ width: '80%', height: '1px', backgroundColor: '#f2b705', margin: '0 auto 25px auto', opacity: 0.5 }}></div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', lineHeight: '1', margin: '0' }}>
                        PROGRAMA<br />FASCINANTES
                    </h1>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '40px 0' }}>
                    <img src="/Radar-2.png" alt="Radar Gráfico" style={{ width: '420px', height: 'auto' }} />
                </div>

                {/* USER INFO SECTION - NOW AT TOP OF THE BOTTOM BLOCK */}
                {(userName || date) && (
                    <div style={{ marginBottom: '20px', display: 'inline-block', width: '100%' }}>
                        {userName && <p style={{ fontSize: '24px', fontWeight: '900', color: '#00121d', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>{userName}</p>}
                        {date && <p style={{ fontSize: '15px', color: '#00121d', margin: '8px 0 0 0', opacity: 0.8, fontWeight: '600' }}>{date}</p>}
                        
                        {/* GOLDEN DIVIDER */}
                        <div style={{ width: '60px', height: '2px', backgroundColor: '#f2b705', margin: '25px auto', opacity: 0.8 }}></div>
                    </div>
                )}

                <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00121d', marginBottom: '10px', marginTop: '0', lineHeight: '1.4' }}>
                        Modelo de dominios fundamentales<br />basado en la metodología MLT
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <img src="/logo-azul.png" alt="Auténticos" style={{ height: '38px' }} />
                </div>
            </div>

            {/* PAGE 1: TITLE, RADAR, EXPERT ANALYSIS */}
            <div className="pdf-page" id="pdf-page-1">
                <header className="pdf-header">
                    <h1>RESULTADO<br/>AUTODIAGNÓSTICO</h1>
                </header>

                <div className="pdf-radar-container" style={{ width: '100%', height: '480px' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <FascinantesRadar data={domainScores} height={480} radius="60%" isPDF={true} />
                    </div>
                </div>

                <div className="pdf-tables-section">
                    <div className="pdf-table-desc" style={{ marginBottom: '15px' }}>
                        En la siguiente tabla encontraras tu resultado y la escala en que se encuentra para que desde allí puedas iniciar tu proceso de crecimiento personal y profesional.
                    </div>

                    <div className="pdf-table-container">
                        <table className="pdf-score-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>Corporal</th>
                                    <th style={{ width: '15%' }}>Mental</th>
                                    <th style={{ width: '15%' }}>Emocional</th>
                                    <th style={{ width: '15%' }}>Social</th>
                                    <th style={{ width: '15%' }}>Espiritual</th>
                                    <th style={{ width: '15%' }}>Financiero</th>
                                    <th style={{ width: '10%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{getScoreByDomain('corporal')}</td>
                                    <td>{getScoreByDomain('mental')}</td>
                                    <td>{getScoreByDomain('emocional')}</td>
                                    <td>{getScoreByDomain('social')}</td>
                                    <td>{getScoreByDomain('espiritual')}</td>
                                    <td>{getScoreByDomain('financiero')}</td>
                                    <td style={{ fontWeight: 800 }}>{totalScore}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="pdf-table-container">
                        <table className="pdf-scale-table">
                            <thead>
                                <tr>
                                    <th>Luz</th>
                                    <th>Nivel</th>
                                    <th>Rango</th>
                                    <th>Estado de Bienestar Integral</th>
                                </tr>
                            </thead>
                            <tbody>
                                {levelData.map(l => (
                                    <tr key={l.level} className={userLevel === l.level ? 'active-level-row' : ''}>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="pdf-luz-circle" style={{ background: l.color }}></div>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{l.level}</td>
                                        <td style={{ textAlign: 'center', fontWeight: '600', whiteSpace: 'nowrap' }}>{l.range}</td>
                                        <td>{l.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pdf-page-number">1</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 2: REFLECTION TEXT */}
            <div className="pdf-page" id="pdf-page-2">
                <h2 className="pdf-reflection-title">RADAR DE VIDA: UNA HERRAMIENTA PARA LA EVOLUCIÓN</h2>
                
                <p className="pdf-reflection-text">
                    <strong>{userName || 'Usuario'}</strong>, acabas de ver una fotografía de tu equilibrio actual. ¿Cómo te sientes?
                </p>
                <p className="pdf-reflection-text">
                    A veces no resulta sencillo reconocer cómo se está distribuyendo tu energía, pero ten en cuenta que esto es solo un pantallazo de hoy, no un juicio sobre tu valor.
                </p>
                <p className="pdf-reflection-text">
                    Míralo como una referencia personal para este momento de tu vida.
                </p>
                <p className="pdf-reflection-text">
                    Un radar que integra seis dominios que consideramos los pilares de todo: <strong>Corporal, mental, emocional, social, espiritual y financiero.</strong> Sabemos que juntos forman esa base sólida donde se apoya tu bienestar, tus decisiones y, por supuesto, tus resultados.
                </p>
                <p className="pdf-reflection-text">
                    En <strong>Auténticos</strong> tenemos claro que esto no define quién eres en esencia, ni le pone techo a lo que eres capaz de lograr. Como cualquier foto, solo captura un segundo, no la película completa, porque entendemos que tu vida es <strong>dinámica</strong>. Cambia con cada decisión que tomas y con lo que eliges transformar.
                </p>
                <p className="pdf-reflection-text">
                    Por eso, no te pedimos que busques un "equilibrio perfecto". En nuestra experiencia, no existe tal equilibrio. Siempre habrá momentos donde un área te va a exigir más que otra; siempre habrá tensiones y prioridades que inclinen la balanza.
                </p>
                <p className="pdf-reflection-text">
                    Nuestro propósito con este radar no es que todas las líneas midan lo mismo, sino que seas <strong>consciente</strong> de cómo están.
                </p>
                <p className="pdf-reflection-text">
                    Queremos que puedas observar con total claridad dónde estás invirtiendo tu vida y dónde te está costando. Porque estamos convencidos de que solo cuando ves las cosas como son, puedes decidir con intención.
                </p>
                <p className="pdf-reflection-text">
                    <strong>Si sabes quién eres y cómo estás, puedes elegir hacia dónde vas.</strong>
                </p>

                <div className="pdf-page-number">2</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 3: DYNAMIC READING */}
            <div className="pdf-page" id="pdf-page-3">
                <h2 className="pdf-reflection-title" style={{ marginBottom: '30px' }}>LECTURA DEL RESULTADO</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', marginTop: '0' }}>
                    <h3 style={{ color: currentReading.color, fontSize: '24px', fontWeight: '900', margin: 0 }}>
                        {currentReading.title}
                    </h3>
                    <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        backgroundColor: currentReading.color,
                        border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                </div>
                
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4b5563', marginBottom: '25px', marginTop: '0', fontStyle: 'italic' }}>
                    {currentReading.subtitle}
                </h4>

                {currentReading.paragraphs.map((p, i) => (
                    <p key={i} className="pdf-reflection-text">
                        {p.includes('Auténticos') ? p.split('Auténticos').map((chunk, idx, arr) => 
                            idx === arr.length - 1 ? chunk : <React.Fragment key={idx}>{chunk}<strong>Auténticos</strong></React.Fragment>
                        ) : p}
                    </p>
                ))}

                <div style={{ marginTop: '35px', padding: '20px', backgroundColor: '#f8fafc', borderLeft: `6px solid ${currentReading.color}`, borderRadius: '0 8px 8px 0' }}>
                    <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#111827' }}>
                        <strong>{currentReading.step.split(':')[0]}:</strong>{currentReading.step.substring(currentReading.step.indexOf(':') + 1)}
                    </p>
                </div>



                <div className="pdf-page-number">3</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 4: DOMAIN CARDS */}
            <div className="pdf-page" id="pdf-page-4">
                <div style={{ marginTop: '40px', marginBottom: '0' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', marginBottom: '12px', marginTop: '0' }}>
                        RESULTADOS POR CADA DOMINIO
                    </h2>
                    <p className="pdf-reflection-text" style={{ marginBottom: '15px' }}>
                        Aquí verás el balance de tu atención y energía reciente. Estos números son una invitación a entender las dinámicas detrás de tu día a día. 
                    </p>
                    <p className="pdf-reflection-text" style={{ marginBottom: '25px' }}>
                        Obsérvalos con apertura para descubrir dónde actuar con mayor intención. El cambio empieza por reconocer nuestras bases; te recomendamos priorizar el área señalada con "Bajo" o "Requiere Atención".
                    </p>
                </div>

                <div className="pdf-domains-grid" style={{ marginTop: '0' }}>
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
                                            <span>{score.domain.includes('Dominio') ? score.domain : `Dominio ${score.domain}`}</span>
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
                        <strong>NOTA IMPORTANTE:</strong> Este autodiagnóstico es una herramienta de reflexión personal. 
                        Los resultados reflejan tu percepción actual en cada dominio y sirven como base para tu Plan de Acción personalizado.
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                    Si quieres más información o acompañamiento ingresa a <span data-pdf-link="https://www.autenticos.co/" style={{ fontWeight: 'bold', color: '#00121d' }}>www.autenticos.co</span> o escríbenos a <span data-pdf-link="mailto:contacto@autenticos.co" style={{ fontWeight: 'bold', color: '#00121d' }}>contacto@autenticos.co</span>
                </div>

                <div className="pdf-page-number">4</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>
            {/* PAGES 5 TO 10: QA TABLES */}
            {!hideQAPages && fascinantesDomains.map((domain, index) => {
                const pageIndex = index + 5;
                const questions = fascinantesQuestions.filter(q => q.domain === domain.id);
                const scoreData = domainScores.find(s => s.id === domain.id);
                
                // Buscar el rango de interpretación específico para este puntaje
                const scoreValue = scoreData?.score || 0;
                const interp = fascinantesInterpretations.find(i => scoreValue >= i.range[0] && scoreValue <= i.range[1]);

                return (
                    <div key={domain.id} className="pdf-page" id={`pdf-page-${pageIndex}`}>
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ color: DOMAIN_STYLES[domain.id]?.color || '#000' }}>
                                {getDomainIcon(domain.id)}
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', margin: '0' }}>
                                {domain.name}
                            </h2>
                        </div>

                        {interp && (
                            <div className="pdf-interpretation-box" style={{ borderLeftColor: DOMAIN_STYLES[domain.id]?.color || '#f2b705', padding: '15px' }}>
                                <div className="pdf-interpretation-score-info" style={{ margin: 0 }}>
                                    Tu puntaje en este dominio: <strong>{scoreValue} pts</strong>
                                </div>
                            </div>
                        )}
                        
                        <table className="pdf-qa-table">

                            <thead>
                                <tr>
                                    <th>Pregunta</th>
                                    <th className="pdf-qa-number-cell">Selección</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q) => {
                                    const ans = userAnswers[q.id];
                                    return (
                                        <tr key={q.id}>
                                            <td style={{ fontSize: '13px', lineHeight: '1.4' }}>{q.text}</td>
                                            <td className="pdf-qa-number-cell" style={{ fontSize: '14px' }}>
                                                {ans ? ans : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="pdf-page-number">{pageIndex}</div>
                        <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                            <img src="/logo-azul.png" alt="Logo" />
                        </footer>
                    </div>
                );
            })}

            {/* PAGE 11: FINAL REFLECTION */}
            <div className="pdf-page" id="pdf-page-11" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#f2b705', textTransform: 'uppercase', marginBottom: '10px', marginTop: '0' }}>
                    TU MAPA DE TRANSFORMACIÓN
                </h1>
                
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4b5563', marginBottom: '40px', marginTop: '0' }}>
                    Guía práctica para un liderazgo integral en equilibrio
                </h2>

                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#111827', marginBottom: '20px' }}>
                    Lo que viste en tu diagnóstico no es casualidad. Es el resultado de decisiones, hábitos y prioridades que, con el tiempo, han ido moldeando tu forma de actuar, de relacionarte y de liderar.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#111827', marginBottom: '20px' }}>
                    Aquí no se trata de alcanzar un equilibrio perfecto. Se trata de desarrollar la capacidad de darte cuenta cuándo te estás desviando y hacer los ajustes necesarios a tiempo.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#111827', marginBottom: '20px' }}>
                    A partir de ahora el reto no es hacerlo mejor, sino hacerlo conscientemente. Elegir dónde enfocarte, qué sostener y qué cambiar, entendiendo que cada decisión impacta directamente la vida que estás construyendo.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#111827', marginBottom: '0' }}>
                    Si te involucras de verdad en este proceso, no solo vas a generar cambios puntuales. Vas a empezar a dirigir con mayor intención la forma en la que vives y lideras.
                </p>

                <div className="pdf-page-number">11</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 12: ACCION FASE 1 */}
            <div className="pdf-page" id="pdf-page-12">
                <div style={{ borderBottom: '2px solid #f2b705', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', marginBottom: '10px', marginTop: '0' }}>
                        FASE I:
                    </h2>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#00121d', marginTop: '0', marginBottom: '0' }}>
                        Análisis y foco estratégico
                    </h3>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">1</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">1. Documenta tu estado actual</h4>
                        <p className="pdf-action-text">Analiza tus resultados en los seis dominios: Corporal, Mental, Emocional, Social, Espiritual y Financiero. Considera estos datos como una fotografía técnica de tus últimos 90 días, no como un juicio de valor.</p>
                        <div className="pdf-insight-box">
                            <p><strong>La claridad de los datos elimina el peso de la culpa y permite la acción.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">2</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">2. Identifica tu fuga de energía</h4>
                        <p className="pdf-action-text">Elige un solo dominio como prioridad absoluta. El enfoque es tu recurso más escaso; busca aquel punto que, aunque no tenga el puntaje más bajo, hoy te genera el mayor desgaste emocional.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Resolver una sola fuga es más efectivo que intentar sostener seis frentes simultáneos.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">3</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">3. Establece el objetivo mínimo (7 días)</h4>
                        <p className="pdf-action-text">Define una acción para esta semana que sea pequeña, medible y, sobre todo, repetible. La prioridad aquí no es la intensidad, sino consolidar el hábito.</p>
                        <div className="pdf-insight-box">
                            <p><strong>El éxito temprano genera el impulso necesario para los cambios de largo plazo.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block" style={{ marginBottom: 0 }}>
                    <div className="pdf-circle-num">4</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">4. Ajusta las condiciones de tu entorno</h4>
                        <p className="pdf-action-text">Modifica tu espacio para que la disciplina sea sencilla. Crea obstáculos para los hábitos que quieres dejar y facilita el acceso a las acciones que quieres integrar.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Un entorno bien diseñado reduce la dependencia de la fuerza de voluntad.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-page-number">12</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(5412%) hue-rotate(205deg) brightness(85%) contrast(100%)' }} />
                </footer>
            </div>

            {/* PAGE 13: ACCION FASE 2 */}
            <div className="pdf-page" id="pdf-page-13">
                <div style={{ borderBottom: '2px solid #f2b705', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', marginBottom: '10px', marginTop: '0' }}>
                        FASE II:
                    </h2>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#00121d', marginTop: '0', marginBottom: '0' }}>
                        Sostenibilidad y ajuste
                    </h3>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">5</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">5. Establece un compromiso externo</h4>
                        <p className="pdf-action-text">Comunica tu objetivo a una persona cuya opinión respetes. El compromiso público aumenta la probabilidad de cumplimiento y rompe el aislamiento del líder.</p>
                        <div className="pdf-insight-box">
                            <p><strong>La transparencia con terceros refuerza la integridad personal.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">6</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">6. Ejecuta una medición diaria</h4>
                        <p className="pdf-action-text">Lleva un registro rápido de 30 segundos cada noche. Evalúa si cumpliste tu objetivo y califica tu nivel de energía y paz mental en una escala de 1 a 5.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Gestionar con datos evita que las opiniones o el cansancio distorsionen tu progreso.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">7</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">7. Realiza una auditoría semanal</h4>
                        <p className="pdf-action-text">Dedica 15 minutos a revisar tres puntos: qué funcionó, qué dificultades surgieron y qué ajustes aplicarás la próxima semana.</p>
                        <div className="pdf-insight-box">
                            <p><strong>La mejora continua se basa en ajustes tácticos constantes, no en cambios drásticos.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block" style={{ marginBottom: '40px' }}>
                    <div className="pdf-circle-num">8</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">8. Evalúa la tendencia de crecimiento</h4>
                        <p className="pdf-action-text">Repite el autodiagnóstico integral cada tres meses. El propósito es observar la trayectoria de tus indicadores y recalibrar tu estrategia de vida.</p>
                        <div className="pdf-insight-box">
                            <p><strong>El crecimiento consciente requiere una revisión periódica del rumbo.</strong></p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: '50px' }}>
                    <p style={{ fontSize: '18px', fontStyle: 'italic', color: '#00121d', lineHeight: '1.6', margin: '0' }}>
                        "No se trata de saber más, sino de actuar mejor.<br/>
                        Pequeñas decisiones, bien sostenidas, terminan cambiando el rumbo de tu vida."
                    </p>
                </div>

                <div className="pdf-page-number">13</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(5412%) hue-rotate(205deg) brightness(85%) contrast(100%)' }} />
                </footer>
            </div>

        </div>
    );
});

export default FascinantesReportTemplate;
