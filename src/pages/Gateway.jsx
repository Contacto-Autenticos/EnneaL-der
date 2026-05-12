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
                    <img 
                        src="/logo-moneda.png" 
                        alt="Auténticos Logo" 
                        className="gateway-logo"
                    />
                </div>

                <div className="gateway-buttons">
                    <button 
                        className="gateway-btn"
                        onClick={() => navigate("/eneagrama")}
                    >
                        Eneagrama
                    </button>
                    
                    <button 
                        className="gateway-btn secondary"
                        onClick={() => navigate("/dominios-landing")}
                    >
                        6 Dominios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Gateway;
