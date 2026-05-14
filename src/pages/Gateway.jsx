import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Gateway.css';

const Gateway = () => {
    const navigate = useNavigate();

    return (
        <div className="gateway-container">
            <div className="gateway-overlay"></div>
            
            <div className="gateway-content">
                <div className="gateway-logo-container">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img 
                            src="/logo-moneda.png" 
                            alt="Auténticos Logo" 
                            className="gateway-logo"
                        />
                    </a>
                </div>

                <div className="gateway-buttons">
                    <button 
                        className="gateway-btn"
                        onClick={() => navigate("/eneagrama")}
                    >
                        Eneagrama
                    </button>
                    
                    <button 
                        className="gateway-btn"
                        onClick={() => navigate("/dominios-landing")}
                    >
                        6 Dominios
                    </button>

                    <button 
                        className="gateway-btn-outline"
                        onClick={() => navigate("/diagnostico-empresarial")}
                        style={{ 
                            background: 'transparent', 
                            border: '2px solid #ddbe3d', 
                            color: '#ddbe3d',
                            marginTop: '0.5rem'
                        }}
                    >
                        Diagnóstico Empresarial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Gateway;
