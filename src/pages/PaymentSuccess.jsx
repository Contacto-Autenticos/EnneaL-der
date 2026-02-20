import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="payment-success-page">
            <div className="payment-success-container">

                <div className="success-hero">
                    <h1 className="success-hero-title">¡Excelente decisión!</h1>
                </div>

                {/* Box 1: Intro */}
                <div className="success-box">
                    <p className="success-text">
                        Has dado un paso consciente hacia un mayor nivel de claridad personal.
                    </p>
                    <p className="success-text">
                        Este es un test avanzado que está diseñado para ofrecerte un análisis profundo de tu personalidad y patrones de liderazgo desde la perspectiva del Eneagrama.
                    </p>
                </div>

                {/* Box 2: Benefits */}
                <div className="success-box">
                    <h3 className="success-subtitle">Lo que descubrirás en tu informe</h3>
                    <ul className="benefit-list">
                        <li className="benefit-item">
                            <Check className="benefit-icon" />
                            Identificación precisa de tu eneatipo dominante
                        </li>
                        <li className="benefit-item">
                            <Check className="benefit-icon" />
                            Motivaciones y miedos centrales
                        </li>
                        <li className="benefit-item">
                            <Check className="benefit-icon" />
                            Estructura de tus centros de inteligencia
                        </li>
                        <li className="benefit-item">
                            <Check className="benefit-icon" />
                            Dinámicas de crecimiento y desarrollo
                        </li>
                        <li className="benefit-item">
                            <Check className="benefit-icon" />
                            Claves aplicadas a liderazgo y toma de decisiones
                        </li>
                    </ul>
                </div>

                {/* Elegant Quote */}
                <blockquote className="success-quote">
                    Este no es un test superficial.<br />
                    Es una herramienta de claridad personal.
                </blockquote>

                <div className="payment-actions">
                    <button
                        onClick={() => navigate('/advanced-intro')}
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
