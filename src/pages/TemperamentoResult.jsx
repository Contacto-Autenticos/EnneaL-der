import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react';
import './LiderazgoResults.css';

const TEMPERAMENT_DESCRIPTIONS = {
    'Sanguíneo': {
        title: 'Sanguíneo',
        color: '#f97316', // Orange
        description: 'A las personas sanguíneas conviene hablarles con entusiasmo, cercanía y claridad. Suelen responder mejor cuando sienten conexión, reconocimiento y posibilidad de participar.',
        leadThem: 'Es importante canalizar su energía, darles espacios de expresión y ayudarles a convertir sus ideas en compromisos concretos.',
        leadership: 'Como líder, inspiras a tu equipo con energía, entusiasmo y optimismo. Para potenciar tu liderazgo, asegúrate de mantener el enfoque, dar seguimiento a los detalles y estructurar los compromisos para convertirlos en resultados concretos.'
    },
    'Colérico': {
        title: 'Colérico',
        color: '#ef4444', // Red
        description: 'A las personas coléricas conviene hablarles de forma directa, clara y orientada a resultados. Suelen valorar la autonomía, los retos y las decisiones oportunas.',
        leadThem: 'Es importante darles objetivos definidos, margen de acción y retroalimentación firme sin caer en confrontaciones innecesarias.',
        leadership: 'Como líder, impulsas a tu equipo hacia la acción y los resultados de forma rápida y decidida. Para potenciar tu liderazgo, recuerda cultivar la paciencia, escuchar activamente a los demás y equilibrar la firmeza con la empatía.'
    },
    'Melancólico': {
        title: 'Melancólico',
        color: '#3b82f6', // Blue
        description: 'A las personas melancólicas conviene hablarles con profundidad, respeto y precisión. Suelen responder mejor cuando entienden el sentido, los detalles y la coherencia de lo que se les propone.',
        leadThem: 'Es importante darles tiempo para analizar, cuidar la calidad del proceso y reconocer su sensibilidad y criterio.',
        leadership: 'Como líder, aportas profundidad, orden y un alto estándar de calidad al trabajo. Para potenciar tu liderazgo, procura no frenarte por el perfeccionismo, confía más al delegar tareas y celebra los pequeños avances del equipo.'
    },
    'Flemático': {
        title: 'Flemático',
        color: '#10b981', // Green
        description: 'A las personas flemáticas conviene hablarles con calma, paciencia y confianza. Suelen valorar la estabilidad, la armonía y los ambientes donde no se sienten presionadas innecesariamente.',
        leadThem: 'Es importante acompañarlas con claridad, invitarlas a tomar posición y ayudarles a avanzar sin romper su serenidad.',
        leadership: 'Como líder, creas un ambiente de confianza, estabilidad y armonía, siendo un excelente mediador. Para potenciar tu liderazgo, atrévete a tomar decisiones difíciles más rápido e impulsa al equipo a salir de su zona de confort.'
    }
};

const TemperamentoResult = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const savedResult = localStorage.getItem('temperamentResult');
        if (savedResult && TEMPERAMENT_DESCRIPTIONS[savedResult]) {
            setResult(savedResult);
        }
    }, []);

    if (!result) {
        return (
            <div className="lr-error-container">
                <div className="lr-error-card">
                    <h2>No se encontraron resultados</h2>
                    <p>Por favor, completa el test para ver tu temperamento.</p>
                    <button className="lr-btn-primary" onClick={() => navigate('/test-temperamento')}>
                        Ir al Test <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    const data = TEMPERAMENT_DESCRIPTIONS[result];

    return (
        <div className="liderazgo-results-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '0', background: '#fff' }}>
            <header className="lr-header" style={{ background: 'linear-gradient(135deg, #0a1118 0%, #112031 100%)', padding: '50px 20px' }}>
                <div className="lr-header-content">
                    <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 'bold', opacity: 0.9, color: '#fff', margin: '0' }}>Tu temperamento es:</h1>
                    <h2 className="temperamento-title-responsive" style={{ color: data.color, margin: '5px 0 0 0', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.3)', lineHeight: '1' }}>
                        {data.title}
                    </h2>
                </div>
            </header>

            <main className="lr-main" style={{ flex: 1 }}>
                <section className="lr-section lr-profile-hero" style={{ padding: '30px 15px' }}>
                    <div className="lr-score-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <div className="lr-level-info" style={{ padding: '15px 30px 30px' }}>
                            <div style={{ textAlign: 'left', marginTop: '10px' }}>
                                <h3 style={{ color: '#002d44', marginBottom: '10px' }}>¿Cómo comunicarte contigo?</h3>
                                <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '25px' }}>
                                    {data.description}
                                </p>

                                <h3 style={{ color: '#002d44', marginBottom: '10px' }}>¿Cómo liderarlos?</h3>
                                <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '25px' }}>
                                    {data.leadThem}
                                </p>

                                <h3 style={{ color: '#002d44', marginBottom: '10px' }}>Consejos de Liderazgo</h3>
                                <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: '1.6', padding: '15px', background: 'rgba(221, 190, 61, 0.1)', borderLeft: '4px solid #ddbe3d', borderRadius: '4px' }}>
                                    <strong>{data.leadership}</strong>
                                </p>

                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="lr-actions" style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '30px 20px 10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => navigate('/g-1-genuinos-intro')}
                    className="lr-btn lr-btn-secondary"
                >
                    <ArrowLeft size={18} /> Volver al Programa
                </button>
                <button
                    onClick={() => {
                        localStorage.removeItem('temperamentResult');
                        navigate('/test-temperamento');
                    }}
                    className="lr-btn lr-btn-primary"
                >
                    <RefreshCw size={18} /> Repetir Test
                </button>
            </footer>
            <div className="test-footer" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: '20px' }}>
                <img
                    src="/logo-azul.png"
                    alt="Logo Auténticos"
                    className="test-footer-logo"
                />
            </div>
        </div>
    );
};

export default TemperamentoResult;
