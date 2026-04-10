import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import './Hub.css';

const Genuinos = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState({
        enneagram: false,
        advanced: false
    });

    useEffect(() => {
        const storedResult = localStorage.getItem('enneagramResult');
        const storedAdvancedResult = localStorage.getItem('enneagramAdvancedResult');
        
        setResults({
            enneagram: !!storedResult,
            advanced: !!storedAdvancedResult
        });
    }, []);

    const analyses = [
        {
            id: 'enneagram',
            title: 'Test de Eneagrama Básico',
            description: 'Descubre tu esencia y patrones de comportamiento básicos.',
            path: '/test-intro',
            completed: results.enneagram,
            icon: <ArrowRight size={20} />
        },
        {
            id: 'leadership',
            title: 'Test de Eneagrama Avanzado',
            description: 'Analiza tu impacto como líder y cómo potenciar a tu equipo.',
            path: '/test-liderazgo',
            completed: results.advanced,
            icon: <ArrowRight size={20} />
        }
    ];

    return (
        <div className="hub-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <button onClick={() => navigate('/hub')} className="btn-back-hub">
                        <ArrowLeft size={18} /> Volver al Hub
                    </button>
                    <h1 className="hub-title" style={{ color: '#ddbe3d' }}>GENUINOS</h1>
                    <p className="hub-subtitle">
                        <strong>Conocerse es poder</strong>, cuando un líder se conoce, se vuelve genuino… <br />
                        y cuando es genuino, su influencia se multiplica.
                    </p>
                </header>

                <div className="hub-grid">
                    {analyses.map((analysis) => (
                        <div 
                            key={analysis.id} 
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Genuinos;
