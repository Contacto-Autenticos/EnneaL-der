import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PartnerGateway = () => {
    const { partnerId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (partnerId) {
            // Guardamos el origen del socio en el almacenamiento local
            localStorage.setItem('partner_source', partnerId.toLowerCase().trim());
            console.log('Alianza detectada:', partnerId);
        }
        
        // Redirigimos al usuario para que inicie el test gratuito
        // Reemplaza la ruta actual en el historial para que si le da "atrás", no vuelva a caer en el gateway
        navigate('/eneagrama-test-intro', { replace: true });
    }, [partnerId, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002d44', color: '#ddbe3d' }}>
            Preparando tu análisis...
        </div>
    );
};

export default PartnerGateway;
