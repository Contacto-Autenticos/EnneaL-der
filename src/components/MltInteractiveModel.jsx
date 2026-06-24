import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const MltInteractiveModel = () => {
    const nodesRef = useRef([]);
    const iconsRef = useRef([]);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    
    const [activeModal, setActiveModal] = useState(null);

    const timelineData = [
        {
            id: 'Genuinos',
            title: 'Genuinos',
            subtitle: 'Autoconocimiento',
            img: '/Logo-Genuinos-03.png',
            text: 'El punto de partida de todo proceso de transformación es el autoconocimiento. Comprender quién eres, reconocer tus fortalezas, identificar tus patrones y entender aquello que impulsa tus decisiones te permite construir sobre una base sólida.'
        },
        {
            id: 'Trascendentes',
            title: 'Trascendentes',
            subtitle: 'Sentido de propósito',
            img: '/Logo-Trascendentes-03.png',
            text: 'Toda persona necesita una dirección. Cuando conectas con aquello que da sentido a tu vida, tus decisiones adquieren mayor coherencia y tu energía encuentra un propósito más claro.'
        },
        {
            id: 'Fascinantes',
            title: 'Fascinantes',
            subtitle: 'Desarrollo integral',
            img: '/Logo-Fascinantes-03.png',
            text: 'No basta con saber quién eres ni hacia dónde quieres ir. También necesitas desarrollar las capacidades físicas, mentales, emocionales, relacionales y espirituales que te permitan sostener ese camino.'
        },
        {
            id: 'Extraordinarios',
            title: 'Extraordinarios',
            subtitle: 'Liderazgo estratégico',
            img: '/Logo-Extraordinarios-03.png',
            text: 'El liderazgo, la influencia y la capacidad de generar resultados no son fruto del azar. Son el resultado de aprender a actuar con responsabilidad, visión, estrategia y determinación.'
        },
        {
            id: 'Conscientes',
            title: 'Conscientes',
            subtitle: 'Reconexión personal',
            img: '/Logo-Conscientes-03.png',
            text: 'La evolución humana no consiste únicamente en lograr más cosas. Consiste en vivir con mayor presencia, sabiduría y conexión contigo mismo, con los demás y con la vida.'
        }
    ];

    const modalContent = {
        'Genuinos': {
            dirigido: 'Personas que buscan profundizar en su autoconocimiento y liderar con mayor autenticidad, equilibrio y conexión humana.',
            objetivos: 'Potenciar líderes auténticos que conozcan su estilo de liderazgo, gestionen mejor sus equipos y aprovechen mejor sus talentos y los pongan al servicio de la organización.',
            beneficios: [
                'Profundo autoconocimiento y comprensión del propio estilo de liderazgo.',
                'Potenciación de los talentos naturales y su aplicación en el trabajo.',
                'Mejora en la comunicación, la empatía y las relaciones laborales.',
                'Incremento del nivel de consciencia y madurez emocional.',
                'Equipos más colaborativos y auténticos.',
                'Líderes más coherentes, confiables y equilibrados.'
            ]
        },
        'Trascendentes': {
            dirigido: 'Líderes y profesionales que quieren sentir que su trabajo tiene una razón de ser que va más allá de generar ingresos y desean dejar huella con su labor cotidiana.',
            objetivos: 'Aumentar el nivel de compromiso de los líderes y sus equipos con su labor diaria, convirtiendo el trabajo en un instrumento de realización personal y profesional.',
            beneficios: [
                'Conexión clara con el propósito personal y colectivo.',
                'Mayor inspiración y sentido en el trabajo diario.',
                'Equipos más resilientes y comprometidos con el impacto que generan.',
                'Alineación entre visión personal y objetivos empresariales.',
                'Cultura organizacional más coherente, humana y sostenible.',
                'Fortalecimiento de la reputación y valor percibido por el mercado.',
                'Capacidad de generar legado e impacto trascendente.'
            ]
        },
        'Fascinantes': {
            dirigido: 'Profesionales que requieren equilibrar trabajo, familia y tiempo personal en medio de múltiples responsabilidades.',
            objetivos: 'Impulsar líderes integrales capaces de equilibrar su vida personal y profesional, fortaleciendo su bienestar, mientras alcanzan sus más importantes objetivos personales y profesionales.',
            beneficios: [
                'Cuerpos más saludables y vitales.',
                'Mente enfocada, creativa y en equilibrio.',
                'Emociones mejor gestionadas ante la presión y el cambio.',
                'Relaciones más empáticas, saludables y constructivas.',
                'Conexión profunda con el propósito y la autenticidad personal.',
                'Líderes más humanos, conscientes y coherentes.',
                'Equipos inspirados por el ejemplo, no solo por las metas.'
            ]
        },
        'Extraordinarios': {
            dirigido: 'Profesionales en cargos de liderazgo que deben lograr un equilibrio entre el resultado y el cuidado del equipo en el proceso.',
            objetivos: 'Empoderar a los líderes para que asuman la responsabilidad de sus acciones e inspirar a sus equipos a lograr resultados de manera sostenible y coherente.',
            beneficios: [
                'Recuperación del poder personal y sentido de responsabilidad.',
                'Mayor efectividad en la planeación, ejecución y logro de resultados.',
                'Equipos más autónomos, colaborativos y enfocados.',
                'Comunicación asertiva y relaciones laborales más constructivas.',
                'Capacidad para negociar, resolver y decidir con claridad.',
                'Incremento del pensamiento crítico, la creatividad y la mejora continua.',
                'Liderazgo coherente, inspirador y con propósito.'
            ]
        },
        'Conscientes': {
            dirigido: 'Personas que buscan vivir con mayor presencia, reconectando con lo esencial y elevando su nivel de consciencia.',
            objetivos: 'Desarrollar la capacidad de vivir el momento presente, disminuyendo la reactividad y aumentando la sabiduría para enfrentar los retos cotidianos.',
            beneficios: [
                'Mayor capacidad para vivir en el momento presente.',
                'Reducción significativa del estrés y la ansiedad.',
                'Conexión genuina y profunda con los demás.',
                'Sabiduría y ecuanimidad ante situaciones complejas.',
                'Equilibrio interior y paz mental.',
                'Capacidad de adaptación y fluidez ante los cambios.',
                'Visión más amplia, compasiva e integradora del mundo y de la vida.'
            ]
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        nodesRef.current.forEach(node => {
            if (node) observer.observe(node);
        });

        const handleScroll = () => {
            if (!containerRef.current || !progressRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const triggerPoint = windowHeight * 0.6; // Start lighting up as it scrolls into middle of screen
            
            let progress = 0;
            if (rect.top > triggerPoint) {
                progress = 0;
            } else if (rect.bottom < triggerPoint) {
                progress = 100;
            } else {
                progress = ((triggerPoint - rect.top) / rect.height) * 100;
            }
            
            progressRef.current.style.height = `${Math.min(Math.max(progress, 0), 100)}%`;
            
            const currentLinePx = (progress / 100) * rect.height;
            nodesRef.current.forEach((node, i) => {
                if (!node || !iconsRef.current[i]) return;
                const nodeCenter = node.offsetTop + 40;
                if (currentLinePx >= nodeCenter) {
                    iconsRef.current[i].style.boxShadow = '0 0 45px rgba(221, 190, 61, 1)';
                    iconsRef.current[i].style.borderColor = '#ffe566';
                } else {
                    iconsRef.current[i].style.boxShadow = '0 0 20px rgba(221, 190, 61, 0.3)';
                    iconsRef.current[i].style.borderColor = '#ddbe3d';
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div ref={containerRef} className="mlt-vertical-timeline-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0', position: 'relative' }}>
            <style>
                {`
                .mlt-vertical-timeline-node {
                    display: flex;
                    align-items: flex-start;
                    gap: 40px;
                }
                .mlt-timeline-line-bg, .mlt-timeline-line-fg {
                    left: 40px;
                }
                @media (max-width: 600px) {
                    .mlt-vertical-timeline-node {
                        gap: 20px;
                    }
                    .mlt-timeline-line-bg, .mlt-timeline-line-fg {
                        left: 30px;
                    }
                    .mlt-vertical-timeline-icon {
                        width: 60px !important;
                        height: 60px !important;
                    }
                }
                `}
            </style>

            {/* Vertical Line BG */}
            <div className="mlt-timeline-line-bg" style={{ 
                position: 'absolute', 
                top: '0', 
                bottom: '0', 
                width: '4px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '2px',
                transform: 'translateX(-50%)',
                zIndex: 1
            }}></div>

            {/* Gradient Line */}
            <div ref={progressRef} className="mlt-timeline-line-fg" style={{ 
                position: 'absolute', 
                top: '0', 
                height: '0%', 
                width: '4px', 
                background: 'linear-gradient(to bottom, #ddbe3d, rgba(221, 190, 61, 0.2))', 
                borderRadius: '2px',
                transform: 'translateX(-50%)',
                zIndex: 1,
                boxShadow: '0 0 15px rgba(221, 190, 61, 0.6)',
                transition: 'height 0.1s ease-out'
            }}></div>

            {timelineData.map((item, index) => (
                <div 
                    key={item.id}
                    className="mlt-vertical-timeline-node"
                    ref={el => nodesRef.current[index] = el}
                    style={{
                        position: 'relative',
                        marginBottom: index === timelineData.length - 1 ? '0' : '60px',
                        opacity: 0,
                        transform: 'translateY(30px)',
                        transition: 'all 0.6s ease',
                        zIndex: 2
                    }}
                >
                    {/* Icon Node */}
                    <div 
                        className="mlt-vertical-timeline-icon" 
                        ref={el => iconsRef.current[index] = el}
                        onClick={() => setActiveModal(item.id)}
                        style={{
                        width: '80px',
                        height: '80px',
                        flexShrink: 0,
                        background: '#002d44',
                        borderRadius: '50%',
                        border: '2px solid #ddbe3d',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 20px rgba(221, 190, 61, 0.3)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        transition: 'all 0.4s ease',
                        cursor: 'pointer'
                    }}>
                        {item.img ? (
                            <img src={item.img} alt={item.title} style={{ width: '55%', height: 'auto', objectFit: 'contain' }} />
                        ) : (
                            item.icon
                        )}
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: '10px' }}>
                        <h3 style={{ color: '#ddbe3d', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 5px 0' }}>
                            {item.title}
                        </h3>
                        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '500', margin: '0 0 15px 0' }}>
                            {item.subtitle}
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: '1.6', margin: '0' }}>
                            {item.text} <span onClick={() => setActiveModal(item.id)} style={{ color: '#ddbe3d', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>Ver más</span>
                        </p>
                    </div>
                </div>
            ))}

            {/* Modal */}
            {activeModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 15, 22, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }} onClick={() => setActiveModal(null)}>
                    <style>
                        {`
                        .mlt-modal-content {
                            background-color: #001d2d;
                            border: 1px solid rgba(221, 190, 61, 0.2);
                            border-radius: 24px;
                            padding: 40px;
                            max-width: 850px;
                            width: 100%;
                            max-height: 95vh;
                            overflow-y: auto;
                            position: relative;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                        }
                        
                        .modal-prog__header {
                            text-align: center;
                            margin-bottom: 30px;
                            position: relative;
                        }
                        
                        .modal-prog__icon {
                            position: absolute;
                            top: -5px;
                            left: 0;
                            width: 90px;
                            height: auto;
                        }
                        
                        .modal-prog__title {
                            color: #ddbe3d;
                            font-size: clamp(1.2rem, 5.5vw, 2.2rem);
                            font-weight: 800;
                            line-height: 1.1;
                            text-transform: uppercase;
                            margin: 0;
                            letter-spacing: 2px;
                        }
                        
                        .modal-prog__subtitle {
                            color: #ffffff;
                            font-size: 1.2rem;
                            font-weight: 400;
                            margin-top: 5px;
                            margin-bottom: 0;
                        }
                        
                        .modal-prog__grid {
                            display: grid;
                            grid-template-columns: 1fr 1.2fr;
                            gap: 20px;
                        }
                        
                        .modal-prog__col-left {
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                        }
                        
                        .modal-prog__box {
                            background: rgba(30, 60, 75, 0.4);
                            border: 1px solid rgba(255, 255, 255, 0.05);
                            border-radius: 18px;
                            padding: 24px;
                            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
                            flex: 1;
                        }
                        
                        .modal-prog__box-title {
                            color: #ddbe3d;
                            font-size: 1.25rem;
                            font-weight: 600;
                            margin-top: 0;
                            margin-bottom: 15px;
                        }
                        
                        .modal-prog__text {
                            font-size: 0.95rem;
                            color: #ffffff;
                            line-height: 1.5;
                            margin: 0;
                        }
                        
                        .modal-prog__list {
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .modal-prog__list li {
                            position: relative;
                            padding-left: 15px;
                            margin-bottom: 10px;
                            font-size: 0.92rem;
                            color: #ffffff;
                            line-height: 1.4;
                        }
                        
                        .modal-prog__list li::before {
                            content: "•";
                            position: absolute;
                            left: 0;
                            top: 0;
                            color: #ffffff;
                        }

                        @media (max-width: 768px) {
                            .modal-prog__grid {
                                grid-template-columns: 1fr;
                            }
                            .modal-prog__icon {
                                position: relative;
                                display: block;
                                margin: 0 auto 15px;
                                width: 80px;
                            }
                            .mlt-modal-content {
                                padding: 25px;
                            }
                        }
                        `}
                    </style>
                    <div className="mlt-modal-content" onClick={e => e.stopPropagation()}>
                        
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{
                                position: 'absolute',
                                top: '20px', right: '20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#ffffff', cursor: 'pointer', transition: 'all 0.3s ease',
                                zIndex: 2
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#ddbe3d';
                                e.currentTarget.style.color = '#001520';
                                e.currentTarget.style.borderColor = '#ddbe3d';
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'rotate(0deg)';
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div className="modal-prog__header">
                            <img src={timelineData.find(t => t.id === activeModal).img} alt={activeModal} className="modal-prog__icon" />
                            <h2 className="modal-prog__title">
                                {activeModal}
                            </h2>
                            <h3 className="modal-prog__subtitle">
                                {timelineData.find(t => t.id === activeModal).subtitle}
                            </h3>
                        </div>

                        <div className="modal-prog__grid">
                            <div className="modal-prog__col-left">
                                <div className="modal-prog__box">
                                    <h4 className="modal-prog__box-title">Dirigido a:</h4>
                                    <p className="modal-prog__text">
                                        {modalContent[activeModal].dirigido}
                                    </p>
                                </div>
                                <div className="modal-prog__box">
                                    <h4 className="modal-prog__box-title">Objetivos:</h4>
                                    <p className="modal-prog__text">
                                        {modalContent[activeModal].objetivos}
                                    </p>
                                </div>
                            </div>

                            <div className="modal-prog__box">
                                <h4 className="modal-prog__box-title">Beneficios:</h4>
                                <ul className="modal-prog__list">
                                    {modalContent[activeModal].beneficios.map((beneficio, idx) => (
                                        <li key={idx}>
                                            {beneficio}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MltInteractiveModel;
