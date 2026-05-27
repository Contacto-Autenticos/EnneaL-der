import React, { forwardRef } from 'react';
import { User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import FascinantesRadar from './FascinantesRadar';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import './FascinantesReportTemplate.css';

const DOMAIN_STYLES = {
    corporal: { color: '#cc0000', class: 'neon-corporal' },
    mental: { color: '#ff9100', class: 'neon-mental' },
    emocional: { color: '#DDBE3D', class: 'neon-emocional' },
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
        { level: 3, color: '#DDBE3D', range: '219 a 285', status: 'Funcional: La vida "funciona", pero hay áreas grises que frenan el potencial real.' },
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
                "Hay momentos en los que uno siente que no está avanzando, sino tratando de sostener todo al mismo tiempo.",
                "Cuando miras este resultado desde ese lugar, empieza a tener sentido. No es que no puedas, es que vienes cargando más de lo que tu estructura hoy alcanza a sostener. Se acumulan cosas, se aplazan decisiones, se responde a lo urgente y poco a poco lo importante va quedando en segundo plano.",
                "Eso, con el tiempo, pasa factura. No siempre de golpe, a veces de forma silenciosa. Menos energía, menos claridad, más ruido interno.",
                "Y ahí suele aparecer una trampa: intentar resolverlo haciendo más. Pero en este punto, hacer más de lo mismo no cambia nada. Lo que cambia las cosas es detenerte lo suficiente para entender qué estás sosteniendo y por qué lo sigues sosteniendo así."
            ],
            step: "Tu siguiente paso: Agenda una sesión de priorización inmediata con un profesional que pueda acompañarte en el proceso. El objetivo es estabilizar las fugas de energía antes de intentar avanzar."
        },
        2: {
            title: "Nivel 2: Inestabilidad",
            color: "#ff9100",
            subtitle: '"Salir del modo reactivo"',
            paragraphs: [
                "Seguramente no estás quieto. Haces cosas, te mueves, intentas avanzar.",
                "El tema es que cuando miras con un poco más de calma, notas que ese avance no siempre se sostiene. Hay días en los que todo fluye y otros en los que parece que empiezas de nuevo. Como si algo se desordenara en el camino.",
                "No es falta de ganas. Tampoco de capacidad.",
                "Tiene más que ver con cómo estás organizando lo que haces y desde dónde lo estás haciendo. Sin una estructura clara, la energía se dispersa, las decisiones pierden fuerza y lo que comienzas no termina de consolidarse.",
                "Por eso la sensación se repite: mucho esfuerzo, poco resultado acumulado.",
                "Aquí el punto no es acelerar. Es ordenar. Porque cuando eso pasa, lo que hoy se diluye empieza a tomar forma."
            ],
            step: 'Tu siguiente paso: Define tu "Pilar Maestro". Elige un solo dominio para estructurar esta semana y deja que el resto se apoyen en él.'
        },
        3: {
            title: "Nivel 3: Funcional",
            color: "#DDBE3D",
            subtitle: '"Que lo bueno no sea enemigo de lo extraordinario"',
            paragraphs: [
                "Hay una forma de vivir en la que todo parece estar bien.",
                "Cumples, respondes, avanzas. Las cosas funcionan y, si alguien lo mira desde afuera, probablemente diría que vas bien. Y justamente ahí está lo interesante de este resultado.",
                "Cuando todo funciona, no hay urgencia de cambiar.",
                "Pero si te miras un poco más de cerca, empiezas a notar ciertos espacios que no estás atendiendo. Decisiones que vienes dejando para después, conversaciones que sabes que deberías tener, aspectos de tu vida que sostienes en automático porque ya aprendiste a hacerlo así.",
                "No incomoda lo suficiente como para obligarte a moverte, pero sí limita lo suficiente como para que no crezcas.",
                "Y sin darte cuenta, te acostumbras a una versión de tu vida que funciona… pero no necesariamente te representa por completo."
            ],
            step: 'Tu siguiente paso: Auditoría de "Áreas Grises". Vamos a identificar ese 20% de ajustes que liberará el 80% de tu potencial oculto.'
        },
        4: {
            title: "Nivel 4: Desarrollo",
            color: "#00ff00",
            subtitle: '"Dueño de tu propio crecimiento"',
            paragraphs: [
                "Aquí ya hay algo distinto en la forma en la que te estás relacionando contigo mismo.",
                "No porque todo esté resuelto, sino porque hay más conciencia. Empiezas a ver con mayor claridad lo que te pasa, cómo respondes frente a eso y qué efecto tiene en lo que estás construyendo. Eso cambia la calidad de tus decisiones.",
                "Cuando una persona entra en este punto, deja de moverse solo por reacción y empieza a hacerlo con intención. Se equivoca, ajusta, vuelve a intentar… pero ya no desde el mismo lugar.",
                "Eso genera algo importante: sensación de dirección.",
                "El reto aquí no es llegar a un punto ideal. Es no soltar esa capacidad de observarte y ajustar, incluso cuando las cosas van bien."
            ],
            step: "Tu siguiente paso: Escalamiento. Es momento de sistematizar tus hábitos para que este bienestar sea automático y no dependa solo de tu fuerza de voluntad."
        },
        5: {
            title: "Nivel 5: Plenitud",
            color: "#3b82f6",
            subtitle: '"La maestría de la coherencia"',
            paragraphs: [
                "A veces uno piensa que esto se trata de llegar a un punto en el que todo está resuelto.",
                "Pero cuando miras este resultado con calma, lo que aparece no es perfección, es coherencia.",
                "Hay una relación más clara entre lo que piensas, lo que haces y lo que estás construyendo. Las decisiones no salen solo desde la presión o la reacción, sino desde un lugar más consciente. Y eso se empieza a notar en todo: en cómo trabajas, en cómo te relacionas, en cómo eliges.",
                "Eso no elimina los retos, pero sí cambia la forma en que los enfrentas.",
                "Más que un resultado, esto habla de una forma de estar. De no perderte en medio de lo que pasa, de poder volver a ti incluso cuando las cosas se mueven.",
                "Y sostener eso, en el tiempo, también es parte del camino."
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
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ddbe3d', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        RESULTADOS Y PASOS A SEGUIR
                    </p>
                    <div style={{ width: '80%', height: '1px', backgroundColor: '#ddbe3d', margin: '0 auto 25px auto', opacity: 0.5 }}></div>
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
                        <div style={{ width: '60px', height: '2px', backgroundColor: '#ddbe3d', margin: '25px auto', opacity: 0.8 }}></div>
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

                <div className="pdf-radar-container" style={{ width: '100%', height: '420px' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <FascinantesRadar data={domainScores} height={420} radius="50%" isPDF={true} />
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
                <h2 className="pdf-reflection-title">LO QUE ESTÁS VIENDO</h2>
                
                <p className="pdf-reflection-text">
                    <strong>{userName || 'Usuario'}</strong>, lo que aparece aquí no es una verdad absoluta, pero tampoco es casualidad.
                </p>
                
                <p className="pdf-reflection-text">
                    Es una fotografía de cómo has estado funcionando en los últimos meses. De las decisiones que has tomado, de lo que has sostenido… y también de lo que has evitado. Cuando uno mira esto con atención, empieza a notar algo importante: los resultados que tiene hoy no son un accidente, son la consecuencia de una forma de pensar, de actuar y, sobre todo, de observarse.
                </p>

                <p className="pdf-reflection-text">
                    Puede que haya partes de este resultado que te resulten cómodas… y otras que no tanto. Es normal. Nadie está completamente equilibrado, y el objetivo tampoco es estarlo. El valor de esto no está en el número, ni en la gráfica, está en lo que eres capaz de reconocer a partir de lo que estás viendo.
                </p>

                <p className="pdf-reflection-text">
                    Porque cuando logras ver con claridad, aparece una posibilidad distinta: dejar de reaccionar en automático y empezar a decidir con más conciencia. La pregunta no es si el resultado es bueno o malo, la verdadera pregunta es ¿qué estás dispuesto a hacer con esto?
                </p>

                <div className="pdf-page-number">2</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 3: DYNAMIC READING */}
            <div className="pdf-page" id="pdf-page-3">
                <h2 className="pdf-reflection-title" style={{ marginBottom: '30px' }}>LECTURA DEL RESULTADO</h2>
                
                <div style={{ marginBottom: '15px', marginTop: '0' }}>
                    <h3 style={{ 
                        color: currentReading.color, 
                        fontSize: '24px', 
                        fontWeight: '900', 
                        margin: 0, 
                        lineHeight: '1.2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        {currentReading.title}
                        <div style={{ 
                            width: '22px', 
                            height: '22px', 
                            borderRadius: '50%', 
                            backgroundColor: currentReading.color,
                            flexShrink: 0,
                            transform: 'translateY(-5px)'
                        }} />
                    </h3>
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



                <div className="pdf-page-number">3</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 4: DOMAIN CARDS */}
            <div className="pdf-page" id="pdf-page-4">
                <div style={{ marginTop: '30px', marginBottom: '0' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', marginBottom: '8px', marginTop: '0' }}>
                        RESULTADOS POR CADA DOMINIO
                    </h2>
                    <p className="pdf-reflection-text" style={{ marginBottom: '10px' }}>
                        Aquí verás el balance de tu atención y energía reciente. Estos números son una invitación a entender las dinámicas detrás de tu día a día. 
                    </p>
                    <p className="pdf-reflection-text" style={{ marginBottom: '15px' }}>
                        Obsérvalos con apertura para descubrir dónde actuar con mayor intención. El cambio empieza por reconocer nuestras bases; te recomendamos priorizar el área señalada con "Bajo" o "Requiere Atención".
                    </p>
                </div>

                <div className="pdf-domains-grid" style={{ marginTop: '0', marginBottom: '10px' }}>
                    {[...domainScores]
                        .sort((a, b) => b.score - a.score)
                        .map((score) => {
                            const style = DOMAIN_STYLES[score.id] || { color: '#ddbe3d' };
                            const isCritical = score.score <= 36;

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
                        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ color: DOMAIN_STYLES[domain.id]?.color || '#000', marginTop: '3px' }}>
                                {getDomainIcon(domain.id)}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#00121d', textTransform: 'uppercase', margin: '0' }}>
                                    {domain.name}
                                </h2>
                                {interp && (
                                    <p style={{ fontSize: '15px', color: '#1f2937', margin: '4px 0 0 0', fontWeight: '400' }}>
                                        Tu puntaje en este dominio: <strong style={{ color: '#ddbe3d' }}>{scoreValue}/70 puntos</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                        
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
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ddbe3d', textTransform: 'uppercase', marginBottom: '40px', marginTop: '0' }}>
                    ¿Qué haces con esto?
                </h1>
                
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#111827', marginBottom: '25px', textAlign: 'justify' }}>
                    Hasta aquí, lo que tienes es claridad. Que sirve, pero no es suficiente. Entender lo que te pasa no cambia nada por sí solo. Todos, en algún momento, hemos visto con claridad lo que deberíamos ajustar… y aun así seguimos haciendo lo mismo.
                </p>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#111827', marginBottom: '25px', textAlign: 'justify' }}>
                    Créeme que no es por falta de intención. Cambiar implica algo más incómodo: dejar de justificar lo que ya sabes que no te está funcionando. Si te detienes un momento en tu resultado, es probable que ya estés viendo por dónde empieza ese ajuste. No suele ser algo completamente nuevo, es eso que has venido postergando, esa decisión que sabes que tienes que tomar o ese comportamiento que has normalizado.
                </p>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#111827', marginBottom: '0', textAlign: 'justify' }}>
                    El plan de acción no viene a darte respuestas mágicas. Viene a ponerte frente a algo más simple y retador: empezar a actuar distinto en aquello que ya lograste ver. No necesitas cambiar todo al mismo tiempo, solo debes dejar de mirar hacia otro lado en lo que hoy ya es evidente. Al final, no se trata de tener un buen diagnóstico. Aquí vinimos a elegir a qué quieres darle prioridad, y eso solo depende de ti.
                </p>

                <div className="pdf-page-number">11</div>
                <footer className="pdf-footer" data-pdf-link="https://www.autenticos.co/">
                    <img src="/logo-azul.png" alt="Logo" />
                </footer>
            </div>

            {/* PAGE 12: ACCION FASE 1 */}
            <div className="pdf-page" id="pdf-page-12">
                <div style={{ borderBottom: '2px solid #ddbe3d', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#ddbe3d', textTransform: 'none !important', marginBottom: '0', marginTop: '0' }}>
                        Lo que sigue después de verlo
                    </h2>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">1</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">1. Documenta tu estado actual</h4>
                        <p className="pdf-action-text">No lo dejes en una impresión general, baja lo que viste a algo concreto. Mira tus resultados y nombra qué está pasando en cada dominio. Dónde estás bien, dónde no y qué se repite. Escríbelo sin adornarlo y sin suavizarlo.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Cuando lo pones en claro, deja de ser una sensación… y se convierte en algo con lo que puedes trabajar.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">2</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">2. Identifica tu fuga de energía</h4>
                        <p className="pdf-action-text">No intentes abarcar todo. Elige un solo punto en el que quieras y necesites trabajar. Ese que más se repite, que más te desgasta o que vienes evitando. No tiene que ser el más grave, pero sí el que hoy más impacto está teniendo en tu vida.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Mientras eso siga ahí, todo lo demás se vuelve más difícil de sostener.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">3</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">3. Define el objetivo mínimo (7 días)</h4>
                        <p className="pdf-action-text">Aterriza ese punto en una acción concreta. Algo específico, medible y que realmente puedas cumplir durante los próximos siete días. No busques hacerlo perfecto, busca poder repetirlo consistentemente.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Si no puedes sostenerlo en un mal día, es demasiado grande.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block" style={{ marginBottom: 0 }}>
                    <div className="pdf-circle-num">4</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">4. Ajusta tu entorno</h4>
                        <p className="pdf-action-text">Mira qué está jugando a favor y qué está jugando en contra. Organiza tu espacio, tu tiempo o tus herramientas para que la acción que definiste sea más fácil de ejecutar. Quita fricciones innecesarias y evita depender solo de la fuerza de voluntad.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Cuando el entorno acompaña, sostener el cambio deja de ser una lucha constante.</strong></p>
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

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">5</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">5. Hazlo visible para alguien más</h4>
                        <p className="pdf-action-text">Elige a una persona y cuéntale lo que te propusiste. No para que te controle, sino para que exista fuera de tu cabeza. Cuando lo pones en palabras, cambia la forma en la que te comprometes.</p>
                        <div className="pdf-insight-box">
                            <p><strong>Asegúrate de que sea alguien que no te deje soltarlo tan fácil.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">6</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">6. Mide lo que haces cada día</h4>
                        <p className="pdf-action-text">Al final del día, revisa si cumpliste, nada explicaciones largas, solo escribe si cumplí o no cumplí. Si quieres, califica cómo estuvo tu energía y tu enfoque ese día.</p>
                        <div className="pdf-insight-box">
                            <p><strong>No se trata de hacerlo perfecto. La tarea es no perderte en el proceso.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block">
                    <div className="pdf-circle-num">7</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">7. Revisa tu semana</h4>
                        <p className="pdf-action-text">Antes de empezar una nueva semana, detente unos minutos. Mira qué funcionó, qué no y qué necesitas ajustar. No cambies todo, ajusta lo necesario para sostener lo que ya empezaste.</p>
                        <div className="pdf-insight-box">
                            <p><strong>El avance no viene de hacerlo distinto cada vez, sino de mejorar sobre lo que ya estás haciendo.</strong></p>
                        </div>
                    </div>
                </div>

                <div className="pdf-action-block" style={{ marginBottom: '40px' }}>
                    <div className="pdf-circle-num">8</div>
                    <div className="pdf-action-content">
                        <h4 className="pdf-action-title">8. Vuelve a medirte</h4>
                        <p className="pdf-action-text">En unas semanas, revisa el diagnóstico y establece si hay mejoria. Ahí es donde empiezas a notar si lo que estás haciendo realmente está moviendo algo o no.</p>
                        <div className="pdf-insight-box">
                            <p><strong>El cambio no siempre se siente en el día a día… pero sí se hace evidente cuando lo comparas.</strong></p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: '30px' }}>
                    <p style={{ fontSize: '18px', fontStyle: 'italic', color: '#00121d', lineHeight: '1.6', margin: '0' }}>
                        "No se trata de saber más, sino de actuar mejor.<br/>
                        Pequeñas decisiones, bien sostenidas, terminan cambiando el rumbo de tu vida."
                    </p>
                </div>

                <div className="pdf-contact-card" style={{ 
                    backgroundColor: '#f8fafc', 
                    padding: '20px', 
                    borderRadius: '15px', 
                    border: '1px solid rgba(221, 190, 61, 0.2)',
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                        Si necesitas más información, acompañamiento o un proceso personalizado, no dudes en escribirnos a <strong>contacto@autenticos.co</strong> o ingresa a <span data-pdf-link="https://www.autenticos.co/" style={{ fontWeight: 'bold', color: '#00121d', textDecoration: 'underline' }}>www.autenticos.co</span>
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
