import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './LiderazgoTestIntro.css';

const LiderazgoTestIntro = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "Diagnóstico de Competencias de Liderazgo | Auténticos";

        const updateMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                if (name.startsWith('og:') || name.startsWith('twitter:')) {
                    element.setAttribute('property', name);
                } else {
                    element.setAttribute('name', name);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        updateMeta('description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('og:title', "Diagnóstico de Competencias de Liderazgo | Auténticos");
        updateMeta('og:description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('og:image', "https://enesencia.autenticos.co/og-liderazgo.jpg");
        updateMeta('twitter:title', "Diagnóstico de Competencias de Liderazgo | Auténticos");
        updateMeta('twitter:description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('twitter:image', "https://enesencia.autenticos.co/og-liderazgo.jpg");

        return () => {
            document.title = prevTitle;
        };
    }, []);

    return (
        <div className="container li-intro-container animate-fade-in">
            <div className="li-intro-content-wrapper">
                <div className="li-intro-logo-container">
                    <img
                        src="/Faro azul.png"
                        alt="Faro Azul"
                        className="li-intro-gold-logo animate-zoom-in-slow"
                    />
                </div>
                
                <div className="li-intro-header">
                    <h1 className="li-intro-title">Diagnóstico de competencias de Liderazgo</h1>
                </div>

                <div className="li-intro-body">
                    <p className="li-intro-subtitle">Reconoce cómo estás liderando y dónde puedes crecer.</p>

                    <div className="li-intro-text-box">
                        <p>
                            Explora tu desarrollo actual en cinco dimensiones: liderazgo personal, estratégico, relacional, multiplicador, y consciente y trascendente. Este autodiagnóstico te ayudará a identificar fortalezas y aspectos que requieren atención, a partir de cómo percibes tus comportamientos y decisiones habituales.
                        </p>
                        
                        <p className="li-intro-highlight">
                            <strong>Responde desde tu experiencia cotidiana.</strong>
                        </p>

                        <p>
                            Considera tu comportamiento promedio durante los últimos 90 días. Elige la frecuencia que mejor describa cómo actúas, incluso cuando las cosas se complican. Evita responder desde tus intenciones, compararte con otras personas o basarte en situaciones excepcionales.
                        </p>

                        <p className="li-duration">Duración aproximada: 5 a 7 minutos</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/liderazgo-test')}
                    className="li-btn-continue"
                >
                    Continuar <ArrowRight size={20} />
                </button>
            </div>

            <div className="li-intro-footer">
                <img
                    src="/logo-azul.png"
                    alt="Auténticos Logo Azul"
                    className="li-intro-footer-logo"
                />
            </div>
        </div>
    );
};

export default LiderazgoTestIntro;
