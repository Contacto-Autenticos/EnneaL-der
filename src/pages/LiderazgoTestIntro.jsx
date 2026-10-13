import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './LiderazgoTestIntro.css';

const LiderazgoTestIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="container li-intro-container animate-fade-in">
            <div className="li-intro-content-wrapper">
                <div className="li-intro-logo-container">
                    <img
                        src="/Círculo de conexión y diálogo.png"
                        alt="Círculo de conexión y diálogo"
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
