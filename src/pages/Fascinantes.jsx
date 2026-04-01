import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import './Hub.css';

const Fascinantes = () => {
    const navigate = useNavigate();
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const storedFascinantesResult = localStorage.getItem('fascinantesAnswers');
        setCompleted(!!storedFascinantesResult);
    }, []);

    const analysis = {
        id: 'fascinantes',
        title: 'Autodiagnóstico Fascinantes',
        description: 'Explora tus 6 dominios vitales con una visión futurista 360°.',
        path: '/autodiag-intro',
        completed: completed,
        icon: <ArrowRight size={20} />
    };

    return (
        <div className="hub-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <button onClick={() => navigate('/hub')} className="btn-back-hub">
                        <ArrowLeft size={18} /> Volver al Hub
                    </button>
                    <h1 className="hub-title" style={{ color: '#ddbe3d' }}>FASCINANTES</h1>
                    <p className="hub-subtitle">
                        Liderar no es solo pensar, decidir o saber dirigir... Es <strong>vivir en equilibrio</strong>, <br />
                        en un viaje de autodescubrimiento y revitalización.
                    </p>
                </header>

                <div className="hub-grid">
                    <div 
                        className={`analysis-card ${analysis.completed ? 'completed' : ''}`}
                        onClick={() => navigate(analysis.path)}
                    >
                        <div className="card-status">
                            {analysis.completed ? (
                                <span className="status-badge completed">
                                    <CheckCircle size={14} /> Completado
                                </span>
                            ) : (
                                <span className="status-badge pending">Disponible</span>
                            )}
                        </div>
                        <h3 className="card-title">{analysis.title}</h3>
                        <p className="card-description">{analysis.description}</p>
                        <div className="card-action">
                            <span>{analysis.completed ? 'Ver o Repetir' : 'Comenzar'}</span>
                            {analysis.icon}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Fascinantes;
