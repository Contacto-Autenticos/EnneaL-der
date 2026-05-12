import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Mail } from 'lucide-react';
import './Hub.css'; // Reusing base layout
import './MyResults.css';

const MyResults = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [advancedTestResult, setAdvancedTestResult] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('enneagramUser');
        const storedResult = localStorage.getItem('enneagramResult');
        const storedAdvancedResult = localStorage.getItem('enneagramAdvancedResult');

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedResult) setTestResult(JSON.parse(storedResult));
        if (storedAdvancedResult) setAdvancedTestResult(JSON.parse(storedAdvancedResult));
    }, []);

    const hasAnyResult = testResult || advancedTestResult;

    return (
        <div className="hub-container my-results-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <button onClick={() => navigate('/hub')} className="btn-back-hub">
                        <ArrowLeft size={18} /> Volver al Hub
                    </button>
                    <h1 className="hub-title">Mis Resultados</h1>
                    <p className="hub-subtitle">
                        {user ? `Hola, ${user.name}. ` : ''}
                        Aquí tienes el resumen de tus análisis completados.
                    </p>
                </header>

                {!hasAnyResult ? (
                    <div className="empty-results">
                        <p>Aún no has completado ningún análisis.</p>
                        <button onClick={() => navigate('/hub')} className="btn-start">
                            Comenzar ahora
                        </button>
                    </div>
                ) : (
                    <div className="results-stack">
                        {testResult && (
                            <div className="result-item-card" onClick={() => navigate('/eneagrama-result')}>
                                <div className="result-item-badge">Eneagrama</div>
                                <div className="result-item-content">
                                    <h3>Eneatipo {testResult.enneatype}</h3>
                                    <p>{testResult.dominant.name}</p>
                                </div>
                                <ArrowLeft className="rotate-180" size={18} />
                            </div>
                        )}

                        {advancedTestResult && (
                            <div className="result-item-card" onClick={() => navigate('/eneagrama-advanced-analysis-result')}>
                                <div className="result-item-badge">Liderazgo</div>
                                <div className="result-item-content">
                                    <h3>Perfil {advancedTestResult.confirmedType}</h3>
                                    <p>{advancedTestResult.winner.name}</p>
                                </div>
                                <ArrowLeft className="rotate-180" size={18} />
                            </div>
                        )}
                    </div>
                )}

                <div className="sync-section">
                    <div className="sync-card">
                        <Mail className="sync-icon" size={32} />
                        <div className="sync-text">
                            <h4>¿Quieres guardar estos resultados?</h4>
                            <p>Ingresa tu correo para vincular tus análisis y tenerlos siempre disponibles.</p>
                        </div>
                        <button 
                            className="btn-sync-action"
                            onClick={() => navigate('/eneagrama-advanced-register')}
                        >
                            Vincular con mi Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyResults;
