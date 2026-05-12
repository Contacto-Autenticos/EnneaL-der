import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Hub.css';

const Extraordinarios = () => {
    const navigate = useNavigate();
    return (
        <div className="hub-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <button onClick={() => navigate('/')} className="btn-back-hub">
                        <ArrowLeft size={18} /> Volver al Hub
                    </button>
                    <h1 className="hub-title" style={{ color: '#ddbe3d' }}>EXTRAORDINARIOS</h1>
                    <p className="hub-subtitle">Próximamente...</p>
                </header>
            </div>
        </div>
    );
};

export default Extraordinarios;
