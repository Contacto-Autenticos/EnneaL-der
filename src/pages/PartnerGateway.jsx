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

        // Extraer y persistir datos precargados si vienen en la URL
        try {
            const params = new URLSearchParams(window.location.search);
            const email = params.get('email');
            const name = params.get('name') || params.get('full_name');
            const phone = params.get('phone');
            const birthDate = params.get('birth_date') || params.get('birthDate');

            if (email || name || birthDate) {
                const userData = {
                    name: name || '',
                    full_name: name || '',
                    email: email || '',
                    phone: phone || '',
                    birth_date: birthDate || ''
                };
                localStorage.setItem('tempAutodiagUser', JSON.stringify(userData));
                localStorage.setItem('autenticos_user_data', JSON.stringify(userData));
                if (email) localStorage.setItem('autenticos_user_email', email);
            }
        } catch (e) {
            console.warn('Error parseando query params en PartnerGateway:', e);
        }
        
        // Redirigimos al usuario para que inicie el test gratuito conservando query params
        navigate('/eneagrama-test-intro' + window.location.search, { replace: true });
    }, [partnerId, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002d44', color: '#ddbe3d' }}>
            Preparando tu análisis...
        </div>
    );
};

export default PartnerGateway;
