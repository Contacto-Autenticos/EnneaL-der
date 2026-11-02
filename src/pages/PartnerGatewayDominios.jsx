import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PartnerGatewayDominios = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (partnerId) {
      // Create a specific prefix for Dominios partners to distinguish from Eneagrama
      const formattedPartnerId = `alianza_dominios_${partnerId.toLowerCase()}`;
      
      // Store in localStorage
      localStorage.setItem('partner_source_dominios', formattedPartnerId);
      
      console.log(`[PartnerGatewayDominios] Socio registrado: ${formattedPartnerId}`);

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
        console.warn('Error parseando query params en PartnerGatewayDominios:', e);
      }
      
      // Redirect directly to the registration flow for 6 Dominios preserving query params
      navigate('/dominios' + window.location.search, { replace: true });
    } else {
      // If no partner ID, just redirect to normal flow
      navigate('/dominios-landing', { replace: true });
    }
  }, [partnerId, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#002d44',
      color: '#ddbe3d',
      fontFamily: 'Inter, sans-serif'
    }}>
      <p>Redirigiendo a tu test...</p>
    </div>
  );
};

export default PartnerGatewayDominios;
