import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Globe } from 'lucide-react';
import './FascinantesIntro.css';

const FascinantesIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="fascinantes-intro-page">
            <div className="futuristic-overlay"></div>
            
            <div className="intro-content">
                <header className="intro-header animate-fade-in">
                    <div className="title-image-wrapper">
                        <img src="/Radar-2.png" alt="Fascinantes" className="fascinantes-logo-img" />
                    </div>
                    <h1 className="fascinantes-main-title"><b>Autodiagnóstico <br /> de 6 Dominios</b></h1>
                    <p className="methodology-tag-header">Basado en la metodología Master Live Training (MLT)</p>
                </header>

                <div className="instructions-box animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="instructions-header">
                        <h3>Instrucciones para obtener un resultado más preciso</h3>
                    </div>
                    <div className="instructions-body">
                        <p>Este autodiagnóstico no es un examen; es una pausa para observar con honestidad cómo estás hoy en los seis dominios fundamentales de tu vida.</p>
                        <p style={{ marginTop: '15px' }}>Responde pensando en los últimos 90 días, no en tu mejor versión ni en cómo te gustaría estar. Para cada afirmación, elige un número del 1 al 5 según tu experiencia real.</p>
                    </div>
                    
                    <div className="instructions-divider"></div>
                    <p className="duration-tip-inside">Duración estimada: 15-20 minutos</p>
                </div>

                <div className="intro-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button 
                        className="btn-start-fascinantes"
                        onClick={() => navigate('/autodiag-test')}
                    >
                        INICIAR SECUENCIA <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <footer className="intro-footer-small">
                <img src="/Logo-Blanco.png" alt="Auténticos" />
            </footer>
        </div>
    );
};

export default FascinantesIntro;
