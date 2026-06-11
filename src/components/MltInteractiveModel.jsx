import React, { useState, useEffect, useRef } from 'react';
import './MltInteractiveModel.css';

const MltInteractiveModel = () => {
    const [activeCard, setActiveCard] = useState(null);
    const timelineRef = useRef(null);
    const progressRef = useRef(null);
    const nodesRef = useRef([]);

    const dimensionsData = {
        Genuinos: {
            title: 'Genuinos',
            img: '/Logo-Genuinos-03.png',
            text: 'El punto de partida de todo proceso de transformación es el autoconocimiento. Comprender quién eres, reconocer tus fortalezas, identificar tus patrones y entender aquello que impulsa tus decisiones te permite construir sobre una base sólida.'
        },
        Trascendentes: {
            title: 'Trascendentes',
            img: '/Logo-Trascendentes-03.png',
            text: 'Toda persona necesita una dirección. Cuando conectas con aquello que da sentido a tu vida, tus decisiones adquieren mayor coherencia y tu energía encuentra un propósito más claro.'
        },
        Fascinantes: {
            title: 'Fascinantes',
            img: '/Logo-Fascinantes-03.png',
            text: 'No basta con saber quién eres ni hacia dónde quieres ir. También necesitas desarrollar las capacidades físicas, mentales, emocionales, relacionales y espirituales que te permitan sostener ese camino.'
        },
        Extraordinarios: {
            title: 'Extraordinarios',
            img: '/Logo-Extraordinarios-03.png',
            text: 'El liderazgo, la influencia y la capacidad de generar resultados no son fruto del azar. Son el resultado de aprender a actuar con responsabilidad, visión, estrategia y determinación.'
        },
        Conscientes: {
            title: 'Conscientes',
            img: '/Logo-Conscientes-03.png',
            text: 'La evolución humana no consiste únicamente en lograr más cosas. Consiste en vivir con mayor presencia, sabiduría y conexión contigo mismo, con los demás y con la vida.'
        }
    };

    useEffect(() => {
        const timelineSection = timelineRef.current;
        const timelineProgress = progressRef.current;
        const timelineNodes = nodesRef.current;

        if (timelineSection && timelineProgress && timelineNodes.length > 0) {
            // Observer for node entry animation
            const nodeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        nodeObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            timelineNodes.forEach((node, index) => {
                if (node) {
                    node.style.transitionDelay = `${index * 0.15}s`;
                    nodeObserver.observe(node);
                }
            });

            // Scroll listener for progress line
            const updateTimelineProgress = () => {
                const rect = timelineSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Calculate progress percentage
                const scrollDistance = windowHeight - rect.top;
                const totalScrollable = rect.height + windowHeight * 0.2; // Reaches 100% slightly before leaving viewport

                let percentage = (scrollDistance / totalScrollable) * 100;
                percentage = Math.max(0, Math.min(100, percentage));

                if (window.innerWidth > 900) {
                    timelineProgress.style.width = percentage + '%';
                    timelineProgress.style.height = '4px';
                } else {
                    timelineProgress.style.height = percentage + '%';
                    timelineProgress.style.width = '4px';
                }
            };

            window.addEventListener('scroll', updateTimelineProgress, { passive: true });
            window.addEventListener('resize', updateTimelineProgress, { passive: true });
            // Initial call
            updateTimelineProgress();

            return () => {
                window.removeEventListener('scroll', updateTimelineProgress);
                window.removeEventListener('resize', updateTimelineProgress);
                if (nodeObserver) {
                    nodeObserver.disconnect();
                }
            };
        }
    }, []);

    const addToNodesRef = (el) => {
        if (el && !nodesRef.current.includes(el)) {
            nodesRef.current.push(el);
        }
    };

    return (
        <div className="mlt-interactive-container" style={{ width: '100%' }}>
            {/* ===== RUTA / METODOLOGÍA ===== */}
            <div className="ruta-wrapper">
                <div className="ruta-card" style={{ padding: 0, alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    {/* SISTEMA ORBITAL */}
                    <div className="orbital-system">
                        {/* Núcleo Central */}
                        <div className="orbital-center">
                            <img src="/Logo-MLT-03.png" alt="Centro MLT" />
                        </div>

                        {/* Órbita 1 */}
                        <div className="orbit orbit-1">
                            <div className="orbit-item" style={{ '--angle': '-45deg' }}>
                                <div className="orbit-counter-rotate">
                                    <div className="orbit-icon-glass" onMouseEnter={() => setActiveCard('Genuinos')}>
                                        <img src="/Logo-Genuinos-03.png" alt="Genuinos" />
                                        <span className="orbit-tooltip">GENUINOS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Órbita 2 */}
                        <div className="orbit orbit-2">
                            <div className="orbit-item" style={{ '--angle': '45deg' }}>
                                <div className="orbit-counter-rotate">
                                    <div className="orbit-icon-glass" onMouseEnter={() => setActiveCard('Fascinantes')}>
                                        <img src="/Logo-Fascinantes-03.png" alt="Fascinantes" />
                                        <span className="orbit-tooltip">FASCINANTES</span>
                                    </div>
                                </div>
                            </div>
                            <div className="orbit-item" style={{ '--angle': '225deg' }}>
                                <div className="orbit-counter-rotate">
                                    <div className="orbit-icon-glass" onMouseEnter={() => setActiveCard('Trascendentes')}>
                                        <img src="/Logo-Trascendentes-03.png" alt="Trascendentes" />
                                        <span className="orbit-tooltip">TRASCENDENTES</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Órbita 3 */}
                        <div className="orbit orbit-3">
                            <div className="orbit-item" style={{ '--angle': '135deg' }}>
                                <div className="orbit-counter-rotate">
                                    <div className="orbit-icon-glass" onMouseEnter={() => setActiveCard('Extraordinarios')}>
                                        <img src="/Logo-Extraordinarios-03.png" alt="Extraordinarios" />
                                        <span className="orbit-tooltip">EXTRAORDINARIOS</span>
                                    </div>
                                </div>
                            </div>
                            <div className="orbit-item" style={{ '--angle': '315deg' }}>
                                <div className="orbit-counter-rotate">
                                    <div className="orbit-icon-glass" onMouseEnter={() => setActiveCard('Conscientes')}>
                                        <img src="/Logo-Conscientes-03.png" alt="Conscientes" />
                                        <span className="orbit-tooltip">CONSCIENTES</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ruta-dimensions" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeCard ? (
                        <div key={activeCard} className="dimension-item animate-fade-in" id={`card${activeCard}`} style={{ width: '100%', padding: '30px' }}>
                            <img src={dimensionsData[activeCard].img} alt={activeCard} className="dim-icon" style={{ width: '90px', height: 'auto', flexShrink: 0 }} />
                            <p className="dim-desc" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                                <strong style={{ color: '#ddbe3d', display: 'block', marginBottom: '8px', fontSize: '1.3rem' }}>{dimensionsData[activeCard].title}</strong>
                                {dimensionsData[activeCard].text}
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.6, padding: '40px' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddbe3d" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" />
                                <path d="M12 20v2" />
                                <path d="M4.93 4.93l1.41 1.41" />
                                <path d="M17.66 17.66l1.41 1.41" />
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="M4.93 19.07l1.41-1.41" />
                                <path d="M17.66 6.34l1.41-1.41" />
                            </svg>
                            <p style={{ fontSize: '1.2rem', color: '#fff', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>Pasa el cursor sobre los círculos del modelo para ver los detalles de cada dimensión.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== TEXTO TRANSICION ===== */}
            <div style={{ maxWidth: '900px', margin: '80px auto 30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.4rem', lineHeight: 1.6, fontWeight: 400, color: 'rgba(255,255,255,0.9)' }}>
                    Cada experiencia representa una dimensión fundamental del desarrollo humano. Juntas conforman una ruta diseñada para ayudarte a crecer de manera integral, fortalecer la persona que eres y ampliar tu capacidad para sostener la vida, el liderazgo y el impacto que deseas construir.
                </h2>
            </div>

            {/* ===== RUTA EVOLUCIÓN (TIMELINE) ===== */}
            <div className="timeline-wrapper" ref={timelineRef}>
                <div className="timeline-line"></div>
                <div className="timeline-progress" ref={progressRef}></div>

                <div className="timeline-nodes">
                    {/* Node 1: Inicial */}
                    <div className="timeline-node node--top" ref={addToNodesRef}>
                        <div className="node-content">
                            <span className="node-text-gold">Inicial</span>
                            <span className="node-text-white">Diagnóstico</span>
                        </div>
                        <div className="node-icon-glass">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                                <path d="M18 21a6 6 0 0 0-12 0" />
                                <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Node 2: Genuinos */}
                    <div className="timeline-node node--bottom" ref={addToNodesRef}>
                        <div className="node-icon-glass">
                            <img src="/Logo-Genuinos-03.png" alt="Genuinos" />
                        </div>
                        <div className="node-content">
                            <span className="node-text-gold">Genuinos</span>
                            <span className="node-text-white">Autoconocimiento</span>
                        </div>
                    </div>

                    {/* Node 3: Trascendentes */}
                    <div className="timeline-node node--top" ref={addToNodesRef}>
                        <div className="node-content">
                            <span className="node-text-gold">Trascendentes</span>
                            <span className="node-text-white">Sentido de propósito</span>
                        </div>
                        <div className="node-icon-glass">
                            <img src="/Logo-Trascendentes-03.png" alt="Trascendentes" />
                        </div>
                    </div>

                    {/* Node 4: Fascinantes */}
                    <div className="timeline-node node--bottom" ref={addToNodesRef}>
                        <div className="node-icon-glass">
                            <img src="/Logo-Fascinantes-03.png" alt="Fascinantes" />
                        </div>
                        <div className="node-content">
                            <span className="node-text-gold">Fascinantes</span>
                            <span className="node-text-white">Desarrollo integral</span>
                        </div>
                    </div>

                    {/* Node 5: Extraordinarios */}
                    <div className="timeline-node node--top" ref={addToNodesRef}>
                        <div className="node-content">
                            <span className="node-text-gold">Extraordinarios</span>
                            <span className="node-text-white">Liderazgo estratégico</span>
                        </div>
                        <div className="node-icon-glass">
                            <img src="/Logo-Extraordinarios-03.png" alt="Extraordinarios" />
                        </div>
                    </div>

                    {/* Node 6: Conscientes */}
                    <div className="timeline-node node--bottom" ref={addToNodesRef}>
                        <div className="node-icon-glass">
                            <img src="/Logo-Conscientes-03.png" alt="Conscientes" />
                        </div>
                        <div className="node-content">
                            <span className="node-text-gold">Conscientes</span>
                            <span className="node-text-white">Reconexión personal</span>
                        </div>
                    </div>

                    {/* Node 7: Master */}
                    <div className="timeline-node node--top" ref={addToNodesRef}>
                        <div className="node-content">
                            <span className="node-text-gold">Master</span>
                            <span className="node-text-white">Clausura</span>
                        </div>
                        <div className="node-icon-glass">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                                <path d="M14 10l8-8" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MltInteractiveModel;
