import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './AdvancedTransition.css';

const items = [
    "Analizando patrones de decisión",
    "Identificando motivaciones dominantes",
    "Detectando dinámicas de reacción",
    "Calculando tu perfil de crecimiento"
];

const AdvancedTransition = () => {
    const [progress, setProgress] = useState(0);
    const [visibleItems, setVisibleItems] = useState([]);
    const [statusText, setStatusText] = useState("");
    const [isStatusVisible, setIsStatusVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        // Progress bar timer (7 seconds to full)
        const duration = 7000;
        const interval = 50;
        const step = 100 / (duration / interval);

        const progressTimer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                return next >= 100 ? 100 : next;
            });
        }, interval);

        // Items appearing sequentially during the 7 seconds
        items.forEach((_, index) => {
            setTimeout(() => {
                setVisibleItems(prev => [...prev, index]);
            }, (duration / items.length) * (index + 0.5));
        });

        // Appearing timing for status text
        // 1. Initial status text appear after the last item (at ~6.1s). Using 6.6s for buffer.
        const introStatusTimer = setTimeout(() => {
            setStatusText("Preparando tu resultado personalizado…");
            setIsStatusVisible(true);
        }, 6600);

        // 2. Change status text 1.5 seconds before redirection
        // Total sequence: 13 seconds (7s progress + 6s pause)
        const totalTime = 13000;

        const finalStatusTimer = setTimeout(() => {
            setStatusText("Hemos detectado un patrón dominante en tu perfil.");
        }, totalTime - 1500);

        // Final transition
        const finalTimer = setTimeout(() => {
            navigate('/result-intro');
        }, totalTime);

        return () => {
            clearInterval(progressTimer);
            clearTimeout(introStatusTimer);
            clearTimeout(finalStatusTimer);
            clearTimeout(finalTimer);
        };
    }, [navigate]);

    return (
        <div className="adv-transition-page">
            <div className="adv-transition-container">
                <header className="adv-transition-header">
                    <h1 className="adv-transition-title">Estamos analizando tu perfil de personalidad</h1>
                </header>

                <div className="adv-transition-progress-wrapper">
                    <div className="adv-transition-progress-bg">
                        <div
                            className="adv-transition-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="adv-transition-percent">{Math.round(progress)}%</span>
                </div>

                <div className="adv-transition-content">
                    <p className="adv-transition-description">
                        Nuestro sistema está evaluando diferentes patrones presentes en tus respuestas para identificar con mayor precisión tu perfil de personalidad.
                    </p>

                    <div className="adv-transition-checklist">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className={`adv-transition-item ${visibleItems.includes(index) ? 'visible' : ''}`}
                            >
                                <div className="adv-transition-icon-circle">
                                    <Check size={18} className="adv-transition-check-icon" />
                                </div>
                                <span className="adv-transition-item-text">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="adv-transition-status-container">
                        <p className={`adv-transition-status-text ${isStatusVisible ? 'visible' : ''}`}>
                            {statusText}
                        </p>
                    </div>
                </div>

                <div className="adv-transition-footer">
                    <img
                        src="/Logo-Blanco.png"
                        alt="Auténticos Logo"
                        className="adv-transition-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedTransition;
