import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { questions, options } from '../data/questions';

import { calculateResults } from '../utils/calculator';

const Test = ({ onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
        } else {
            // Calculate result locally and save
            // const result = calculateResults(newAnswers); // Done in App.jsx via onComplete
            onComplete(newAnswers); // Updates local app state
            navigate('/result');
        }
    };

    const renderStars = (label) => {
        const starSize = 18;
        const gold = "#ddbe3d"; // var(--color-primary)
        const gray = "#e0e0e0";

        if (label === "Poco") {
            return (
                <div style={{ display: 'flex', gap: '2px' }}>
                    <Star size={starSize} fill={gray} stroke={gold} strokeWidth={2} />
                </div>
            );
        }
        if (label === "Algo") {
            return (
                <div style={{ display: 'flex', gap: '2px' }}>
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                </div>
            );
        }
        if (label === "Mucho") {
            return (
                <div style={{ display: 'flex', gap: '2px' }}>
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                </div>
            );
        }
        if (label === "Totalmente") {
            return (
                <div style={{ display: 'flex', gap: '2px' }}>
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                    <Star size={starSize} fill={gold} stroke={gold} strokeWidth={0} />
                </div>
            );
        }
        return null;
    };

    return (

        <div className="test-page">
            {/* Header Banner - Full Width */}
            <div className="test-banner">
                <img
                    src="/Eneagrama banner 03.png"
                    alt="Eneagrama Banner"
                    className="test-banner-img animate-fade-in"
                />
            </div>

            <div className="test-container">
                {/* Progress Bar */}
                <div className="test-progress-bar-bg">
                    <div
                        className="test-progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="test-question-header">
                    <span className="test-question-count">
                        Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <h3 className="test-question-text">
                        {currentQuestion.text}
                    </h3>
                </div>

                <div className="test-interaction-wrapper">
                    <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', marginBottom: '15px' }}>
                        Me describe:
                    </p>

                    <div className="test-options-container">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className="option-card test-btn-option"
                            >
                                <span>{option.label}</span>
                                {renderStars(option.label)}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Footer Logo */}
                <div className="test-footer">
                    <img
                        src="/Auténticos - Logo Azul-OP2.png"
                        alt="Logo Auténticos"
                        className="test-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default Test;
