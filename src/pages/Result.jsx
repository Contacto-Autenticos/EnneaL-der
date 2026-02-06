import React, { useMemo, useState, useEffect } from 'react';
import { getEnneagramInfo } from '../utils/calculator';
import { ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

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

const Result = ({ result: initialResult, user, onReset }) => {
    const [result, setResult] = useState(initialResult);
    const [loading, setLoading] = useState(!initialResult);

    useEffect(() => {
        if (!initialResult && user) {
            const fetchResult = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setResult({
                        enneatype: data.enneatype,
                        scores: data.scores,
                        isAmbiguous: data.status === 'flexible' || data.status === 'ambiguous'
                    });
                }
                setLoading(false);
            };
            fetchResult();
        } else if (initialResult) {
            setLoading(false);
            setResult(initialResult);
        }
    }, [user, initialResult]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando resultados...</div>;
    if (!result) return <div style={{ padding: '2rem', textAlign: 'center' }}>No hay resultados disponibles. <button onClick={() => window.location.href = '/test'}>Realizar Test</button></div>;

    const { enneatype, isAmbiguous } = result;
    const info = getEnneagramInfo(enneatype);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Eneagrama & Liderazgo',
                    text: `He descubierto que mi estilo de liderazgo es: ${info.name}. ¡Descubre el tuyo!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop/unsupported browsers
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
            {/* Background Image */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/Gray-logo 02.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1,
                opacity: 0.5 // Optional: adjustments for readability if needed, though user asked for "gran imagen"
            }} />

            <div className="container" style={{ alignItems: 'center', textAlign: 'center', padding: '20px 20px', position: 'relative', zIndex: 1 }}>
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
                        style={{
                            maxWidth: '360px',
                            width: '100%',
                            height: 'auto',
                            borderRadius: '50%',
                            boxShadow: 'var(--shadow-md)'
                        }}
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



                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
                    <a
                        href="https://www.autenticos.co/9-tipos-de-liderazgo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                            backgroundColor: 'var(--color-secondary)',
                            color: 'white',
                            padding: '10px 25px',
                            borderRadius: '30px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        Profundizar más <ExternalLink size={18} />
                    </a>

                    <button
                        onClick={handleShare}
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            padding: '10px 25px',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-md)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
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
