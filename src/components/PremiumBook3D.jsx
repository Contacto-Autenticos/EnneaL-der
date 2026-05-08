import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import gsap from 'gsap';

const Page = React.forwardRef((props, ref) => {
    return (
        <div className="page" ref={ref} style={{ 
            backgroundColor: '#fff', 
            overflow: 'hidden',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
            ...props.style 
        }}>
            <div className="page-content" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img 
                    src={props.image} 
                    alt={`Página ${props.number}`} 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        backgroundColor: '#fff'
                    }} 
                />
                {/* Overlay for paper texture */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.05) 100%)',
                    pointerEvents: 'none'
                }} />
            </div>
        </div>
    );
});

const PremiumBook3D = () => {
    const [isOpen, setIsOpen] = useState(false);
    const bookRef = useRef();
    const containerRef = useRef();

    const pages = [
        '/Reporte_Fascinantes_page-0000.jpg',
        '/Reporte_Fascinantes_page-0001.jpg',
        '/Reporte_Fascinantes_page-0002.jpg',
        '/Reporte_Fascinantes_page-0003.jpg',
        '/Reporte_Fascinantes_page-0004.jpg',
    ];

    useEffect(() => {
        if (isOpen) {
            gsap.to(containerRef.current, {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out"
            });
        } else {
            gsap.set(containerRef.current, {
                scale: 0.7,
                opacity: 0
            });
        }
    }, [isOpen]);

    return (
        <section className="premium-book-section" style={{ 
            height: '100vh', 
            width: '100%', 
            background: '#0a0a0a',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Cinematic background effects */}
            <div className="ambient-glow" style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle at center, rgba(221, 190, 61, 0.12) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />
            
            {!isOpen ? (
                <div className="book-teaser" style={{ zIndex: 10, textAlign: 'center' }}>
                    <div 
                        className="teaser-cover" 
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: '350px',
                            height: '500px',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
                            borderRadius: '4px 20px 20px 4px',
                            overflow: 'hidden',
                            border: '1px solid rgba(221, 190, 61, 0.3)',
                            transform: 'rotateY(-15deg) rotateX(5deg)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'rotateY(-5deg) rotateX(2deg) translateY(-20px) scale(1.05)';
                            e.currentTarget.style.filter = 'drop-shadow(0 50px 80px rgba(0,0,0,0.9))';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(5deg)';
                            e.currentTarget.style.filter = 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))';
                        }}
                    >
                        <img src="/Reporte_Fascinantes_page-0000.jpg" alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.3) 100%)'
                        }} />
                    </div>
                    <button 
                        onClick={() => setIsOpen(true)}
                        style={{
                            marginTop: '50px',
                            background: '#ddbe3d',
                            color: '#000',
                            border: 'none',
                            padding: '18px 60px',
                            borderRadius: '50px',
                            fontSize: '15px',
                            fontWeight: '900',
                            letterSpacing: '5px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 50px rgba(221, 190, 61, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        EXPLORAR REPORTE
                    </button>
                </div>
            ) : (
                <div ref={containerRef} className="book-active-container" style={{ 
                    zIndex: 10, 
                    position: 'relative',
                    width: '90vw',
                    height: '85vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <HTMLFlipBook 
                        width={550} 
                        height={780} 
                        size="stretch"
                        minWidth={315}
                        maxWidth={1200}
                        minHeight={420}
                        maxHeight={1600}
                        maxShadowOpacity={0.6}
                        showCover={true}
                        mobileScrollSupport={true}
                        className="flipbook-canvas"
                    >
                        {pages.map((img, i) => (
                            <Page key={i} image={img} number={i + 1} />
                        ))}
                    </HTMLFlipBook>
                    
                    <div className="book-controls" style={{
                        position: 'absolute',
                        bottom: '-80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '20px'
                    }}>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '12px 30px',
                                borderRadius: '50px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Cerrar y volver
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .flipbook-canvas {
                    box-shadow: 0 50px 100px rgba(0,0,0,0.8);
                }
                .page {
                    background-color: #fdfdfd;
                }
                @media (max-width: 768px) {
                    .teaser-cover {
                        width: 260px !important;
                        height: 380px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default PremiumBook3D;
