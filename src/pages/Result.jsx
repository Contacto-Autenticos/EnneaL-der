import React, { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { getEnneagramInfo } from '../utils/calculator';
import { ExternalLink, RefreshCw, Share2 } from 'lucide-react';



const enneagramImages = {
    "1": "/Eneatipo 1 el reformador.jpg",
    "2": "/Eneatipo 2 el servicial.jpg",
    "3": "/Eneatipo 3 el competitito.jpg",
    "4": "/Eneatipo 4 el creativo.jpg",
    "5": "/Eneatipo 5 el analitico.jpg",
    "6": "/Eneatipo 6 el leal.jpg",
    "7": "/Eneatipo 7 el entusiasta.jpg",
    "8": "/eneatipo 8 el lider.jpg",
    "9": "/eneatipo 9 el conciliador.jpg"
};

const enneagramDescriptions = {
    "1": "Lideras desde principios claros y un fuerte sentido de lo correcto.\nTienes una capacidad natural para ordenar, mejorar y elevar estándares.\nBuscas coherencia entre lo que piensas, sientes y haces.\nCuando confías en tu criterio, inspiras respeto y credibilidad.",
    "2": "Tu liderazgo nace del cuidado genuino por las personas.\nDetectas necesidades con facilidad y sabes crear vínculos de confianza.\nAportas calidez, apoyo y sentido humano a cualquier equipo.\nCuando lideras desde la conciencia, generas compromiso real.",
    "3": "Te mueves con enfoque, energía y orientación a resultados.\nSabes adaptarte y mostrar lo mejor de ti en cada contexto.\nTu liderazgo impulsa el logro y motiva al alto desempeño.\nCuando actúas desde la autenticidad, tu impacto se multiplica.",
    "4": "Lideras desde la sensibilidad, la intuición y la profundidad emocional.\nAportas visión, significado y una mirada auténtica al entorno.\nTienes facilidad para conectar con lo que otros sienten.\nCuando expresas tu singularidad, inspiras desde lo genuino.",
    "5": "Tu liderazgo se apoya en la observación, la claridad y el conocimiento.\nProcesas la información con profundidad y objetividad.\nAportas perspectiva, estrategia y pensamiento independiente.\nCuando compartes lo que sabes, fortaleces decisiones colectivas.",
    "6": "Lideras desde el compromiso, la responsabilidad y la previsión.\nAnticipas riesgos y cuidas la estabilidad del grupo.\nGeneras confianza cuando actúas con coherencia y presencia.\nTu fortaleza crece al confiar en tu criterio interno.",
    "7": "Tu liderazgo se expresa con energía, optimismo y visión de futuro.\nTe mueves hacia nuevas posibilidades con creatividad y entusiasmo.\nAportas dinamismo y motivación al entorno.\nCuando enfocas tu energía, tu impacto se vuelve transformador.",
    "8": "Lideras con presencia, determinación y fuerza interior.\nTe resulta natural tomar decisiones y asumir el control.\nProteges lo que consideras importante y actúas con firmeza.\nCuando lideras desde la conciencia, empoderas a otros.",
    "9": "Tu liderazgo nace de la calma, la escucha y la integración.\nFacilitas acuerdos y generas ambientes de armonía.\nAportas estabilidad y una visión amplia del conjunto.\nCuando afirmas tu voz, tu influencia se fortalece."
};

const Result = ({ result, user, onReset }) => {
    const navigate = useNavigate();

    // If no result, redirect (though App routes handle this too)
    if (!result) return <div style={{ padding: '2rem', textAlign: 'center' }}>No hay resultados disponibles. <button onClick={() => window.location.href = '/test'}>Realizar Test</button></div>;

    const { enneatype } = result;
    const info = getEnneagramInfo(enneatype);



    const shareRef = useRef(null);

    const handleShare = async () => {
        const shareUrl = window.location.origin;

        if (navigator.share) {
            try {
                // Generate image from the ref
                if (shareRef.current) {
                    const canvas = await html2canvas(shareRef.current, {
                        backgroundColor: null, // Allow background image to show
                        scale: 2, // High resolution
                        useCORS: true, // Allow loading remote images (if any)
                        logging: false,
                        onclone: (clonedDoc) => {
                            const imgContainer = clonedDoc.querySelector('.result-img-container');
                            if (imgContainer) {
                                imgContainer.classList.add('share-mode');
                            }
                        }
                    });

                    canvas.toBlob(async (blob) => {
                        if (blob) {
                            const file = new File([blob], 'mi-eneatipo.png', { type: 'image/png' });

                            const shareData = {
                                title: 'Eneagrama & Liderazgo',
                                text: `He descubierto que mi estilo de liderazgo es: ${info.name}. ¡Descubre el tuyo en ${shareUrl}!`,
                                files: [file]
                            };

                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share(shareData);
                            } else {
                                // Fallback if files sharing not supported
                                await navigator.share({
                                    title: 'Eneagrama & Liderazgo',
                                    text: `He descubierto que mi estilo de liderazgo es: ${info.name}. ¡Descubre el tuyo!`,
                                    url: shareUrl
                                });
                            }
                        }
                    }, 'image/png');
                }
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop/unsupported browsers
            navigator.clipboard.writeText(shareUrl);
            alert('¡Enlace al test copiado al portapapeles!');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
            {/* Background Image */}
            <div className="result-bg" />

            <div className="container result-container">
                <div style={{ marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginTop: '5px', lineHeight: '1.4' }}>
                        <span style={{ color: '#002d44', display: 'block' }}>Según tus respuestas,</span>
                        <span style={{ color: '#ddbe3d', display: 'block' }}>tu estilo de liderazgo es:</span>
                    </h2>
                </div>

                <div ref={shareRef} style={{ position: 'relative', backgroundColor: '#fff', overflow: 'hidden', borderRadius: '10px' }}>
                    {/* Watermark Background */}
                    <img
                        src="/Circulo Eneagrama - Autenticos - gold-logo.png"
                        alt=""
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%', // Slightly smaller to avoid edge clipping
                            height: '90%',
                            objectFit: 'contain',
                            opacity: 0.2, // Watermark effect
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}
                    />

                    <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                        <div style={{
                            margin: '10px 0 40px 0',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <div className="result-img-container animate-zoom-in">
                                <img
                                    src={enneagramImages[enneatype] || ""}
                                    alt={`Eneatipo ${enneatype}`}
                                    className="result-type-img"
                                />
                                <div className="result-img-overlay" data-html2canvas-ignore="true"></div>
                            </div>
                        </div>

                        {/* Helper function to determine color based on Enneatype */}
                        {(() => {
                            const getNumberStyle = (type) => {
                                const t = String(type);
                                if (['8', '9', '1'].includes(t)) return { color: '#C0392B' }; // Metallic Red (Deep Red)
                                if (['2', '3', '4'].includes(t)) return { color: '#27AE60' }; // Metallic Green
                                if (['5', '6', '7'].includes(t)) return { color: '#2980B9' }; // Metallic Blue
                                return { color: '#002d44' };
                            };

                            const numberStyle = getNumberStyle(enneatype);

                            return (
                                <>
                                    <h1 style={{ fontSize: '1.8rem', lineHeight: 1.2, marginBottom: '5px' }}>
                                        <span style={{ color: '#002d44' }}>Eneatipo </span>
                                        <span style={{ ...numberStyle, fontWeight: 'bold' }}>{enneatype}</span>
                                        <span style={{ color: '#002d44' }}> - {info.name}</span>
                                    </h1>
                                    <h3 style={{ fontSize: '1.2rem', color: '#ddbe3d', fontWeight: 600, marginBottom: '15px' }}>
                                        {info.role}
                                    </h3>
                                </>
                            );
                        })()}

                        <div style={{ maxWidth: '600px', fontSize: '0.95rem', color: '#555', marginBottom: '10px', marginLeft: 'auto', marginRight: 'auto' }}>
                            <p style={{ marginBottom: '15px', whiteSpace: 'pre-line' }}>
                                {enneagramDescriptions[enneatype]}
                            </p>
                            <p>
                                Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión.  El autoconocimiento es un proceso, no una etiqueta.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="result-actions">
                    <button
                        onClick={handleShare}
                        className="btn-action btn-share"
                    >
                        Compartir <Share2 size={18} />
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="btn-action"
                    >
                        Profundizar más <ExternalLink size={18} />
                    </button>
                </div>

                <button
                    onClick={onReset}
                    style={{
                        marginTop: '20px',
                        background: 'none',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <RefreshCw size={14} /> Realizar test nuevamente
                </button>
            </div>
        </div>
    );
};

export default Result;
