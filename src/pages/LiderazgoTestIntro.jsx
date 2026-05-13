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
                    <h1 className="li-intro-title">DIAGNÓSTICO COMPETENCIAS DE LIDERAZGO AUTÉNTICO</h1>
                </div>

                <div className="li-intro-body">
                    <div className="li-intro-section">
                        <h2 className="li-section-tag">Objetivo</h2>
                        <p className="li-intro-description">
                            Este diagnóstico ha sido diseñado para ofrecer una visión profunda, realista y práctica sobre el nivel actual de desarrollo de competencias clave de liderazgo.
                        </p>
                        <p className="li-intro-description highlight">
                            No mide intención, aspiración o imagen personal. 
                            <strong> Mide comportamientos, decisiones y patrones reales observables.</strong>
                        </p>
                    </div>

                    <div className="li-intro-content-flat">
                        <div className="li-content-header">
                            <CheckCircle2 size={18} className="li-icon-check" />
                            <span>Para obtener resultados confiables:</span>
                        </div>
                        
                        <div className="li-trampas-section">
                            <div className="li-trampas-title">
                                <AlertTriangle size={16} className="li-icon-warn" />
                                <span>Evita estas trampas comunes:</span>
                            </div>
                            <ul className="li-trampas-list">
                                <li>Responder como quisieras ser</li>
                                <li>Compararte con personas con menor desarrollo</li>
                                <li>Justificar patrones improductivos</li>
                                <li>Responder según momentos excepcionales</li>
                                <li>Minimizar debilidades por orgullo o temor</li>
                            </ul>
                        </div>

                        <div className="li-recomendacion">
                            <strong>Recomendación:</strong>
                            <p>Responde considerando tu comportamiento promedio durante los últimos 90 días.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/liderazgo-test')}
                    className="li-btn-continue"
                >
                    Comenzar Diagnóstico <ArrowRight size={20} />
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
