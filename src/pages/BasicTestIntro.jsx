import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './BasicTestIntro.css';

const BasicTestIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="container intro-container animate-fade-in">
            <div className="intro-content-wrapper">
                <div className="intro-logo-container">
                    <img
                        src="/eneagrama_gold.png"
                        alt="Eneagrama Gold"
                        className="intro-gold-logo animate-zoom-in-slow"
                    />
                </div>
                <div className="intro-header">
                    <h1 className="intro-title">Antes de comenzar</h1>
                </div>

                <div className="intro-body">
                    <p className="intro-subtitle">Este test analiza tus tendencias naturales de pensamiento y comportamiento.</p>

                    <div className="intro-text-box">
                        <p className="intro-box-subtitle">Para obtener un resultado más representativo:</p>
                        <p>
                            No pienses en cómo te gustaría ser, sino en <strong>cómo reaccionas en automático,</strong>
                            especialmente <strong>bajo presión o cansancio.</strong> No hay respuestas correctas o incorrectas.
                        </p>
                        <p>
                            Al terminar, recibirás un resultado con <strong>tus 3 tendencias principales</strong> que te permitirán ver tu manera de liderar en el mundo.
                        </p>
                        <p className="intro-duration">Duración aproximada: 3 a 5 minutos</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/test')}
                    className="btn-continue"
                >
                    Continuar <ArrowRight size={20} />
                </button>
            </div>

            <div className="intro-footer">
                <img
                    src="/logo-azul.png"
                    alt="Auténticos Logo Azul"
                    className="intro-footer-logo"
                />
            </div>
        </div>
    );
};

export default BasicTestIntro;
