import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import gsap from 'gsap';

const Page = React.forwardRef((props, ref) => {
    return (
        <div className="page" ref={ref} style={{ 
            backgroundColor: '#fff', 
            overflow: 'hidden',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.05)',
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
                {/* Paper effect overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.02) 100%)',
                    pointerEvents: 'none'
                }} />
            </div>
        </div>
    );
});

const PremiumBook3D = () => {
    const [isOpen, setIsOpen] = useState(false);
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
            gsap.fromTo(containerRef.current, 
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    return (
        <div className="premium-book-integration" style={{ 
            width: '100%', 
            maxWidth: '500px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {!isOpen ? (
                <div className="book-teaser-mini" style={{ width: '100%', textAlign: 'center' }}>
                    <div 
                        className="teaser-cover-mini" 
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: '100%',
                            aspectRatio: '1 / 1.41',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.5s ease',
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                            borderRadius: '4px 16px 16px 4px',
                            overflow: 'hidden',
                            border: '1px solid rgba(221, 190, 61, 0.2)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px) rotateY(-5deg)';
                            e.currentTarget.style.filter = 'drop-shadow(0 30px 50px rgba(0,0,0,0.6))';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.filter = 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))';
                        }}
                    >
                        <img src="/Reporte_Fascinantes_page-0000.jpg" alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.2) 100%)'
                        }} />
                    </div>
                    <p style={{ 
                        marginTop: '20px', 
                        color: '#ddbe3d', 
                        fontSize: '12px', 
                        letterSpacing: '2px', 
                        fontWeight: '700',
                        opacity: 0.8
                    }}>
                        HAZ CLIC PARA ABRIR Y EXPLORAR
                    </p>
                </div>
            ) : (
                <div ref={containerRef} className="book-active-mini" style={{ width: '100%', position: 'relative' }}>
                    <HTMLFlipBook 
                        width={500} 
                        height={700} 
                        size="stretch"
                        minWidth={280}
                        maxWidth={600}
                        minHeight={400}
                        maxHeight={850}
                        maxShadowOpacity={0.4}
                        showCover={true}
                        display="single"
                        mobileScrollSupport={true}
                        className="flipbook-canvas-mini"
                    >
                        {pages.map((img, i) => (
                            <Page key={i} image={img} number={i + 1} />
                        ))}
                    </HTMLFlipBook>
                    
                    <button 
                        onClick={() => setIsOpen(false)}
                        style={{
                            marginTop: '20px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            width: 'fit-content'
                        }}
                    >
                        Cerrar vista
                    </button>
                </div>
            )}

            <style>{`
                .flipbook-canvas-mini {
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                }
            `}</style>
        </div>
    );
};

export default PremiumBook3D;
