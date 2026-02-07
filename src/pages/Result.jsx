import React, { useMemo } from 'react';
import { getEnneagramInfo } from '../utils/calculator';
import { ExternalLink, RefreshCw, Share2 } from 'lucide-react';


const enneagramImages = {
    "1": "/Eneatipo 1 el reformador.png",
    "2": "/Eneatipo 2 el servicial.png",
    "3": "/Eneatipo 3 el competitito.png",
    "4": "/Eneatipo 4 el creativo.png",
    "5": "/Eneatipo 5 el analitico.png",
    "6": "/Eneatipo 6 el leal.png",
    "7": "/Eneatipo 7 el entusiasta.png",
    "8": "/eneatipo 8 el lider.png",
    "9": "/eneatipo 9 el conciliador.png"
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

    // If no result, redirect (though App routes handle this too)
    if (!result) return <div style={{ padding: '2rem', textAlign: 'center' }}>No hay resultados disponibles. <button onClick={() => window.location.href = '/test'}>Realizar Test</button></div>;

    const { enneatype } = result;
    const info = getEnneagramInfo(enneatype);

    const handleShare = async () => {
        const shareUrl = window.location.origin; // Redirects to Home
        const imageUrl = enneagramImages[enneatype];

        let shareData = {
            title: 'Eneagrama & Liderazgo',
            text: `He descubierto que mi estilo de liderazgo es: ${info.name}. ¡Descubre el tuyo!`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                if (imageUrl) {
                    try {
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'resultado-eneagrama.png', { type: blob.type });

                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            shareData.files = [file];
                        }
                    } catch (e) {
                        console.warn("Could not load image for sharing", e);
                    }
                }

                await navigator.share(shareData);
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
                    <span style={{ fontSize: '1rem', color: '#666' }}>Hola, {user?.name || 'Viajero'}</span>
                    <h2 style={{ fontSize: '1.5rem', marginTop: '5px' }}>Tu estilo de liderazgo sugiere:</h2>
                </div>

                <div style={{
                    margin: '10px 0',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <img
                        src={enneagramImages[enneatype] || ""}
                        alt={`Eneatipo ${enneatype}`}
                        className="result-type-img animate-fade-in"
                    />
                </div>

                <h1 style={{ fontSize: '1.8rem', lineHeight: 1.2, marginBottom: '5px' }}>
                    <span style={{ color: '#002d44' }}>Eneatipo {enneatype} - </span>
                    <span style={{ color: '#ddbe3d' }}>{info.name}</span>
                </h1>
                <h3 style={{ fontSize: '1.2rem', color: '#888', fontWeight: 400, marginBottom: '15px' }}>
                    {info.role}
                </h3>

                <div style={{ maxWidth: '600px', fontSize: '0.95rem', color: '#555', marginBottom: '20px' }}>
                    <p style={{ marginBottom: '15px', whiteSpace: 'pre-line' }}>
                        {enneagramDescriptions[enneatype]}
                    </p>
                    <p>
                        Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión.  El autoconocimiento es un proceso, no una etiqueta.
                    </p>
                </div>

                <div className="result-actions">
                    <a
                        href="https://www.autenticos.co/9-tipos-de-liderazgo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-action"
                    >
                        Profundizar más <ExternalLink size={18} />
                    </a>

                    <button
                        onClick={handleShare}
                        className="btn-action btn-share"
                    >
                        Compartir <Share2 size={18} />
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
