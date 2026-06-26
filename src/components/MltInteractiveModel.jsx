import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Laptop, Video, ArrowRight } from 'lucide-react';
const MltInteractiveModel = () => {
    const nodesRef = useRef([]);
    const iconsRef = useRef([]);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    
    const [activeModal, setActiveModal] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [activeModal]);

    const timelineData = [
        {
            id: 'Genuinos',
            title: '1. Genuinos',
            subtitle: 'Autoconocimiento',
            img: '/Logo-Genuinos-03.png',
            text: 'El punto de partida de todo proceso de transformación es el autoconocimiento. Comprender quién eres, reconocer tus fortalezas, identificar tus patrones y entender aquello que impulsa tus decisiones te permite construir sobre una base sólida.'
        },
        {
            id: 'Trascendentes',
            title: '2. Trascendentes',
            subtitle: 'Sentido de propósito',
            img: '/Logo-Trascendentes-03.png',
            text: 'Toda persona necesita una dirección. Cuando conectas con aquello que da sentido a tu vida, tus decisiones adquieren mayor coherencia y tu energía encuentra un propósito más claro.'
        },
        {
            id: 'Fascinantes',
            title: '3. Fascinantes',
            subtitle: 'Desarrollo integral',
            img: '/Logo-Fascinantes-03.png',
            text: 'No basta con saber quién eres ni hacia dónde quieres ir. También necesitas desarrollar las capacidades físicas, mentales, emocionales, relacionales y espirituales que te permitan sostener ese camino.'
        },
        {
            id: 'Extraordinarios',
            title: '4. Extraordinarios',
            subtitle: 'Liderazgo estratégico',
            img: '/Logo-Extraordinarios-03.png',
            text: 'El liderazgo, la influencia y la capacidad de generar resultados no son fruto del azar. Son el resultado de aprender a actuar con responsabilidad, visión, estrategia y determinación.'
        },
        {
            id: 'Conscientes',
            title: '5. Conscientes',
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
                'Conócete',
                'Identifica tu temperamento',
                'Fortalece tu carácter',
                'Potencia tu personalidad',
                'Reconoce tus deseos',
                'Enfrenta tus miedos',
                'Abraza tus conflictos',
                'Cumple tu función',
                'Acelera tu evolución'
            ]
        },
        'Trascendentes': {
            dirigido: 'Líderes y profesionales que quieren sentir que su trabajo tiene una razón de ser que va más allá de generar ingresos y desean dejar huella con su labor cotidiana.',
            objetivos: 'Aumentar el nivel de compromiso de los líderes y sus equipos con su labor diaria, convirtiendo el trabajo en un instrumento de realización personal y profesional.',
            beneficios: [
                'Sentido y propósito',
                'Identifica tus talentos',
                'Desarrolla tus capacidades',
                'Encuentra la inspiración',
                'Presta un servicio',
                'Deja un legado'
            ]
        },
        'Fascinantes': {
            dirigido: 'Profesionales que requieren equilibrar trabajo, familia y tiempo personal en medio de múltiples responsabilidades.',
            objetivos: 'Impulsar líderes integrales capaces de equilibrar su vida personal y profesional, fortaleciendo su bienestar, mientras alcanzan sus más importantes objetivos personales y profesionales.',
            beneficios: [
                'Determina tu nivel de desarrollo',
                'Revitaliza tu cuerpo',
                'Potencia tu mente',
                'Gestiona tus emociones',
                'Cultiva tus relaciones',
                'Conecta con tu esencia',
                'Establece un plan de desarrollo'
            ]
        },
        'Extraordinarios': {
            dirigido: 'Profesionales en cargos de liderazgo que deben lograr un equilibrio entre el resultado y el cuidado del equipo en el proceso.',
            objetivos: 'Empoderar a los líderes para que asuman la responsabilidad de sus acciones e inspirar a sus equipos a lograr resultados de manera sostenible y coherente.',
            beneficios: [
                'Asume la responsabilidad',
                'Define tus objetivos y metas',
                'Gestiona efectivamente el tiempo',
                'Conecta empáticamente',
                'Comunícate asertivamente',
                'Establece acuerdos',
                'Apalanca tus capacidades',
                'Prepárate para crecer',
                'Visiona el futuro',
                'Diseña un plan de acción'
            ]
        },
        'Conscientes': {
            dirigido: 'Personas que buscan integrar su desarrollo personal, profesional y espiritual, fortaleciendo su bienestar y su capacidad de liderar desde la plenitud y la serenidad.',
            objetivos: 'Reconectar a los líderes con su esencia y hacerlos más conscientes para tomar decisiones más sabias, actuar con coherencia y liderar con humanidad e inspiración genuina.',
            beneficios: [
                'El campo de lo invisible',
                'Confía en tu poder',
                'Expresa tu creatividad',
                'Actúa con determinación',
                'Ama incondicionalmente',
                'Manifiesta tu verdad',
                'Atiende las señales',
                'Conecta con la fuente',
                'Expándete',
                'Descansa'
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
                    iconsRef.current[i].style.boxShadow = '0 0 40px rgba(221, 190, 61, 0.8), 0 0 20px rgba(221, 190, 61, 1)';
                    iconsRef.current[i].style.borderColor = '#ffe566';
                    iconsRef.current[i].style.transform = 'scale(1.15)';
                } else {
                    iconsRef.current[i].style.boxShadow = '0 0 15px rgba(221, 190, 61, 0.2)';
                    iconsRef.current[i].style.borderColor = '#ddbe3d';
                    iconsRef.current[i].style.transform = 'scale(1)';
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
                background: 'rgba(0, 45, 68, 0.1)', 
                borderRadius: '2px',
                transform: 'translateX(-50%)',
                zIndex: 1
            }}></div>

            {/* Gradient Line */}
            <div ref={progressRef} className="mlt-timeline-line-fg" style={{ 
                position: 'absolute', 
                top: '0', 
                height: '0%', 
                width: '6px', 
                background: '#ddbe3d', 
                borderRadius: '3px',
                transform: 'translateX(-50%)',
                zIndex: 1,
                boxShadow: '0 0 20px rgba(221, 190, 61, 0.8), 0 0 10px rgba(221, 190, 61, 1)',
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
                        border: '3px solid #ddbe3d',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 15px rgba(221, 190, 61, 0.2)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
                        <h4 style={{ color: '#002d44', fontSize: '1.1rem', fontWeight: '500', margin: '0 0 15px 0' }}>
                            {item.subtitle}
                        </h4>
                        <p style={{ color: 'rgba(0, 45, 68, 0.85)', fontSize: '1.05rem', lineHeight: '1.6', margin: '0' }}>
                            {item.text} <span onClick={() => setActiveModal(item.id)} style={{ color: '#ddbe3d', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>Contenido</span>
                        </p>
                    </div>
                </div>
            ))}

            {/* Modal */}
            {activeModal && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 15, 22, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center', /* Changed back to center because now it should fit and it looks better centered */
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '10px',
                    overflowY: 'auto'
                }} onClick={() => setActiveModal(null)}>
                    <style>
                        {`
                        .mlt-modal-content {
                            background-color: #001d2d;
                            border: 1px solid rgba(221, 190, 61, 0.2);
                            border-radius: 16px;
                            padding: 20px 25px;
                            max-width: 850px;
                            width: 100%;
                            margin: auto;
                            position: relative;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                        }
                        
                        .modal-prog__header {
                            text-align: center;
                            margin-bottom: 12px;
                            position: relative;
                        }
                        
                        .modal-prog__icon {
                            position: absolute;
                            top: -5px;
                            left: 0;
                            width: 55px;
                            height: auto;
                        }
                        
                        .modal-prog__title {
                            color: #ddbe3d;
                            font-size: 1.5rem;
                            font-weight: 800;
                            line-height: 1.1;
                            text-transform: uppercase;
                            margin: 0;
                            letter-spacing: 1.5px;
                        }
                        
                        .modal-prog__subtitle {
                            color: #ffffff;
                            font-size: 1rem;
                            font-weight: 400;
                            margin-top: 5px;
                            margin-bottom: 0;
                        }
                        
                        .modal-prog__grid {
                            display: grid;
                            grid-template-columns: 1fr 1.2fr;
                            gap: 16px;
                        }
                        
                        .modal-prog__col-left {
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                        }
                        
                        .modal-prog__box {
                            background: rgba(30, 60, 75, 0.4);
                            border: 1px solid rgba(255, 255, 255, 0.05);
                            border-radius: 12px;
                            padding: 12px 16px;
                            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
                            flex: 1;
                        }
                        
                        .modal-prog__box-title {
                            color: #ddbe3d;
                            font-size: 1.05rem;
                            font-weight: 600;
                            margin-top: 0;
                            margin-bottom: 4px;
                        }
                        
                        .modal-prog__text {
                            font-size: 1rem;
                            color: #ffffff;
                            line-height: 1.4;
                            margin: 0;
                        }
                        
                        .modal-prog__list {
                            list-style: none;
                            padding: 0;
                            margin: 0;
                        }
                        
                        .modal-prog__list li {
                            position: relative;
                            padding-left: 12px;
                            margin-bottom: 4px;
                            font-size: 1rem;
                            color: #ffffff;
                            line-height: 1.3;
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
                                margin: 0 auto 10px;
                                width: 50px;
                            }
                            .mlt-modal-content {
                                padding: 20px 15px;
                            }
                            .modal-prog__title {
                                font-size: 1.3rem;
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
                            <h2 className="modal-prog__title" style={{ textTransform: 'uppercase', color: '#ffffff' }}>
                                Paso {timelineData.findIndex(t => t.id === activeModal) + 1} - {
                                    activeModal === 'Genuinos' ? 'Conócete' :
                                    activeModal === 'Trascendentes' ? 'Exprésate' :
                                    activeModal === 'Fascinantes' ? 'Equilíbrate' :
                                    activeModal === 'Extraordinarios' ? 'Proyéctate' :
                                    activeModal === 'Conscientes' ? 'Expándete' :
                                    ''
                                }
                            </h2>
                            <h3 className="modal-prog__subtitle" style={{ textTransform: 'uppercase', color: '#ddbe3d', letterSpacing: '1px', fontWeight: '800', fontSize: '1.5rem', marginTop: '4px' }}>
                                {activeModal}
                            </h3>
                        </div>

                        <div className="modal-prog__grid">
                            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
                                <h4 className="modal-prog__box-title" style={{ marginBottom: '15px' }}>
                                    Contenido:
                                </h4>
                                <div className="modal-prog__box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <ul className="modal-prog__list">
                                        {modalContent[activeModal].beneficios.map((beneficio, idx) => (
                                            <li key={idx}>
                                                {beneficio}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
                                <h4 className="modal-prog__box-title" style={{ marginBottom: '15px' }}>
                                    Momentos:
                                </h4>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src="/Momentos-MLT.png" alt="Momentos" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.4)' }} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MltInteractiveModel;
