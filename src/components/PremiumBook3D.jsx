import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import gsap from 'gsap';
import { MousePointerClick, ChevronRight, ChevronLeft } from 'lucide-react';

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
    const flipBook = useRef();

    const pages = Array.from({ length: 14 }, (_, i) => {
        const pageNum = (i + 1).toString().padStart(4, '0');
        return `/Ejemplo resltado autodiagnostico/Reporte_Fascinantes_Carlos_Orozco_page-${pageNum}.jpg`;
    });

    // Handle auto-flip on open
    useEffect(() => {
        if (isOpen && flipBook.current) {
            // Wait a bit for the entrance animation to finish, then flip to page 1
            setTimeout(() => {
                if (flipBook.current && flipBook.current.pageFlip) {
                    flipBook.current.pageFlip().flip(1);
                }
            }, 800);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(containerRef.current, 
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    const flipNext = () => {
        if (flipBook.current && flipBook.current.pageFlip) {
            flipBook.current.pageFlip().flipNext();
        }
    };

    const flipPrev = () => {
        if (flipBook.current && flipBook.current.pageFlip) {
            flipBook.current.pageFlip().flipPrev();
        }
    };

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
                        <img src="/Ejemplo resltado autodiagnostico/Reporte_Fascinantes_Carlos_Orozco_page-0001.jpg" alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.2) 100%)'
                        }} />
                    </div>
                    <div 
                        onClick={() => setIsOpen(true)}
                        style={{ 
                            marginTop: '24px', 
                            color: '#ddbe3d', 
                            fontSize: '11px', 
                            letterSpacing: '2px', 
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                        <MousePointerClick size={18} className="dl-pulse-icon" />
                        <span>HAZ CLIC PARA ABRIR Y EXPLORAR ALGO DEL CONTENIDO</span>
                    </div>
                </div>
            ) : (
                <div ref={containerRef} className="book-active-mini" style={{ width: '100%', position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <HTMLFlipBook 
                            ref={flipBook}
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

                        {/* Navigation Controls */}
                        {/* Left Arrow */}
                        <div 
                            onClick={flipPrev}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '20px',
                                transform: 'translateY(-50%)',
                                zIndex: 100,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                        >
                            <div style={{
                                background: 'rgba(221, 190, 61, 0.95)',
                                color: '#002d44',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                                animation: 'dl-bounce-x-left 1.5s infinite'
                            }}>
                                <ChevronLeft size={24} />
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <div 
                            onClick={flipNext}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                right: '20px',
                                transform: 'translateY(-50%)',
                                zIndex: 100,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                        >
                            <div style={{
                                background: 'rgba(221, 190, 61, 0.95)',
                                color: '#002d44',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                                animation: 'dl-bounce-x 1.5s infinite'
                            }}>
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(false)}
                        style={{
                            marginTop: '30px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '10px 24px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            width: 'fit-content',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        Cerrar vista previa
                    </button>
                </div>
            )}

            <style>{`
                .flipbook-canvas-mini {
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                }
                .dl-pulse-icon {
                    animation: dl-pulse 1.5s infinite;
                }
                @keyframes dl-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                @keyframes dl-bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(8px); }
                }
                @keyframes dl-bounce-x-left {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-8px); }
                }
            `}</style>
        </div>
    );
};

export default PremiumBook3D;
