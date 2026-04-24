import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Target, Globe } from 'lucide-react';
import './FascinantesIntro.css';

const FascinantesIntro = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const isPaid = localStorage.getItem('autodiagPaid') === 'true';
        const hasUser = localStorage.getItem('tempAutodiagUser');
        if (!isPaid || !hasUser) {
            navigate('/dominios');
        }
    }, [navigate]);

    return (
        <div className="fascinantes-intro-page">
            <div className="futuristic-overlay"></div>
            
            <div className="intro-content">
                <header className="intro-header animate-fade-in">
                    <div className="title-image-wrapper">
                        <img src="/Radar-2.png" alt="Fascinantes" className="fascinantes-logo-img" />
                    </div>
                    <h1 className="fascinantes-main-title"><b>6 Dominios <br /> fundamentales</b></h1>
                    <p className="methodology-tag-header">Basado en la metodología Master Live Training (MLT)</p>
                </header>

                <div className="instructions-box animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="instructions-header">
                        <h3>Instrucciones para obtener un resultado más preciso</h3>
                    </div>
                    <div className="instructions-body">
                        <p>Antes de comenzar, queremos que sepas que esto no es un examen, es un momento contigo.</p>
                        <p style={{ marginTop: '15px' }}>Responde desde lo que ha sido real en los últimos 90 días, no desde tu mejor versión ni desde lo que te gustaría que fuera.</p>
                        <p style={{ marginTop: '15px' }}>Elige un número del 1 al 5 en cada afirmación según tu experiencia. No lo pienses demasiado, responde con honestidad. Al final no verás una calificación, verás un reflejo.</p>
                        <p style={{ marginTop: '15px' }}>Tómate este espacio sin afán.</p>
                    </div>
                    
                    <div className="instructions-divider"></div>
                    <p className="duration-tip-inside">Duración estimada: 15-20 minutos</p>
                </div>

                <div className="intro-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button 
                        className="btn-start-fascinantes"
                        onClick={() => navigate('/dominios-test')}
                    >
                        COMENZAR <ArrowRight size={20} />
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
