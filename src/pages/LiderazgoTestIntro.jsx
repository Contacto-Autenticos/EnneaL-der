import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './LiderazgoTestIntro.css';

const LiderazgoTestIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="container li-intro-container animate-fade-in">
            <div className="li-intro-content-wrapper">
                <div className="li-intro-logo-container">
                    <img
                        src="/Icono - Test Liderazgo.png"
                        alt="Liderazgo Auténtico"
                        className="li-intro-gold-logo animate-zoom-in-slow"
                    />
                </div>
                
                <div className="li-intro-header">
                    <h1 className="li-intro-title">Liderazgo Auténtico</h1>
                </div>

                <div className="li-intro-body">
                    <p className="li-intro-subtitle">Una visión profunda, realista y práctica</p>

                    <div className="li-intro-text-box">
                        <p className="li-box-subtitle">Objetivo:</p>
                        <p>
                            No mide intención, aspiración o imagen personal. Mide <strong>comportamientos, decisiones y patrones reales observables.</strong>
                        </p>
                        
                        <div className="li-trampas-section">
                            <p className="li-trampas-title">
                                <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                Evita estas trampas comunes:
                            </p>
                            <ul className="li-trampas-list">
                                <li>Responder como quisieras ser</li>
                                <li>Compararte con personas con menor desarrollo</li>
                                <li>Justificar patrones improductivos</li>
                                <li>Responder según momentos excepcionales</li>
                            </ul>
                        </div>

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
