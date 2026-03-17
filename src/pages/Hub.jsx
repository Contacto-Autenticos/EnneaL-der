import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, User, BarChart2 } from 'lucide-react';
import './Hub.css';

const Hub = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState({
        enneagram: false,
        advanced: false,
        fascinantes: false
    });

    useEffect(() => {
        const storedResult = localStorage.getItem('enneagramResult');
        const storedAdvancedResult = localStorage.getItem('enneagramAdvancedResult');
        const storedFascinantesResult = localStorage.getItem('fascinantesAnswers'); // Check if answers exist
        
        setResults({
            enneagram: !!storedResult,
            advanced: !!storedAdvancedResult,
            fascinantes: !!storedFascinantesResult
        });
    }, []);

    const analyses = [
        {
            id: 'enneagram',
            title: 'Test de Eneagrama',
            description: 'Descubre tu esencia y patrones de comportamiento básicos.',
            path: '/test-intro',
            completed: results.enneagram,
            icon: <ArrowRight size={20} />
        },
        {
            id: 'leadership',
            title: 'Liderazgo & Influencia',
            description: 'Analiza tu impacto como líder y cómo potenciar a tu equipo.',
            path: '/test-liderazgo',
            completed: results.advanced,
            icon: <ArrowRight size={20} />
        },
        {
            id: 'fascinantes',
            title: 'Autodiagnóstico Fascinantes',
            description: 'Explora tus 6 dominios vitales con una visión futurista 360°.',
            path: '/autodiag-intro',
            completed: results.fascinantes,
            icon: <ArrowRight size={20} />
        }
    ];

    return (
        <div className="hub-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <h1 className="hub-title">Centro de Análisis</h1>
                    <p className="hub-subtitle">Explora tus diferentes facetas y potencia tu autoconocimiento.</p>
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

                <div className="hub-footer-actions">
                    <button 
                        className="btn-my-results"
                        onClick={() => navigate('/my-results')}
                    >
                        <BarChart2 size={20} /> Mis Resultados Consolidados
                    </button>
                </div>

                <div className="programs-section">
                    <div className="programs-list">
                        {[
                            { name: 'EXTRAORDINARIOS', icon: '/Logo-Extraordinarios-03.png' },
                            { name: 'FASCINANTES', icon: '/Logo-Fascinantes-03.png' },
                            { name: 'TRASCENDENTES', icon: '/Logo-Trascendentes-03.png' },
                            { name: 'GENUINOS', icon: '/Logo-Genuinos-03.png' },
                            { name: 'CONSCIENTES', icon: '/Logo-Conscientes-03.png' }
                        ].map((program, index) => (
                            <div key={index} className="program-square-card">
                                <div className="program-square-icon">
                                    <img src={program.icon} alt={program.name} />
                                </div>
                                <h4 className="program-square-name">{program.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hub-sync-container">
                    <p className="hub-sync-note">
                        Tus resultados se guardan localmente. <br />
                        Pronto podrás sincronizarlos con tu cuenta.
                    </p>
                </div>
            </div>

            <footer className="hub-footer">
                <img src="/logo-azul.png" alt="Auténticos" className="hub-footer-logo" />
            </footer>
        </div>
    );
};

export default Hub;
