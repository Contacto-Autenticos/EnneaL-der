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
                    <div className="gateway-row">
                        <button 
                            className="gateway-btn"
                            onClick={() => navigate("/diagnostico-empresarial")}
                        >
                            DIAGNÓSTICO EMPR.
                        </button>
                        
                        <button 
                            className="gateway-btn"
                            onClick={() => navigate("/eneagrama")}
                        >
                            Eneagrama
                        </button>
                    </div>
                    
                    <div className="gateway-row">
                        <button 
                            className="gateway-btn"
                            onClick={() => navigate("/dominios-landing")}
                        >
                            6 Dominios
                        </button>

                        <button 
                            className="gateway-btn"
                            onClick={() => navigate("/liderazgo-test-intro")}
                        >
                            Liderazgo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gateway;
