import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const automatedCode = location.state?.automatedCode;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleProceed = () => {
        if (automatedCode) {
            navigate(`/eneagrama-advanced-register?code=${automatedCode}`);
        } else {
            navigate('/eneagrama-advanced-register');
        }
    };

    return (
        <div className="payment-success-page">
            <div className="payment-success-container">

                <div className="success-hero">
                    <h1 className="success-hero-title">¡Excelente decisión!</h1>
                    <p className="success-intro-phrase">Comencemos con tu análisis avanzado</p>
                </div>

                {/* Box 1: Intro */}
                <div className="success-box">
                    <p className="success-text">
                        Has dado un paso consciente hacia un <span style={{ color: '#ffffff', fontWeight: 'bold' }}>mayor nivel de claridad personal.</span>
                    </p>
                    <p className="success-text">
                        La siguiente evaluación profundiza en <span style={{ color: '#ddbe3d', fontWeight: 'bold' }}>tus patrones de pensamiento y comportamiento</span> para identificar con mayor precisión tu estructura de personalidad.
                    </p>
                    <p className="success-text">
                        Las preguntas están diseñadas para <span style={{ color: '#ffffff', fontWeight: 'bold' }}>detectar motivaciones y reacciones</span> que no siempre aparecen en una evaluación inicial.
                    </p>
                    <p className="success-duration">Duración aproximada: 10 minutos</p>
                </div>



                {/* Elegant Quote */}
                <blockquote className="success-quote">
                    Este no es un test superficial.<br />
                    Es una herramienta de claridad personal.
                </blockquote>

                <div className="payment-actions">
                    <button
                        onClick={handleProceed}
                        className="btn-start-analysis"
                    >
                        Comenzar mi análisis Avanzado
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
