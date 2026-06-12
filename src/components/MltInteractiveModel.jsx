import React, { useEffect, useRef } from 'react';

const MltInteractiveModel = () => {
    const nodesRef = useRef([]);
    const containerRef = useRef(null);
    const progressRef = useRef(null);

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
                    <div className="mlt-vertical-timeline-icon" style={{
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
                        WebkitBackdropFilter: 'blur(12px)'
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
                            {item.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MltInteractiveModel;
