import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import './BasicTestIntro.css';

const TemperamentoTestIntro = () => {
    const navigate = useNavigate();

    return (
        <div className="container intro-container animate-fade-in">
            <div className="intro-content-wrapper">
                <div className="intro-logo-container">
                    <img
                        src="/Iconos de programas/Programa_genuinos_huella_icono.png"
                        alt="Temperamento Logo"
                        className="intro-gold-logo animate-zoom-in-slow"
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                    />
                </div>
                <div className="intro-header">
                    <h1 className="intro-title">Antes de comenzar</h1>
                </div>

                <div className="intro-body">
                    <p className="intro-subtitle">Este test analizará tu temperamento dominante.</p>

                    <div className="intro-text-box">
                        <p className="intro-box-subtitle">Para obtener un resultado más representativo:</p>
                        <p>
                            Responde basándote en <strong>cómo actúas naturalmente,</strong>
                            sin pensar demasiado. No hay respuestas correctas ni incorrectas.
                        </p>
                        <p className="intro-duration">Duración aproximada: 2 a 3 minutos</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => navigate('/test-temperamento')}
                        className="btn-continue"
                    >
                        Continuar <ArrowRight size={20} />
                    </button>
                </div>
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

export default TemperamentoTestIntro;
