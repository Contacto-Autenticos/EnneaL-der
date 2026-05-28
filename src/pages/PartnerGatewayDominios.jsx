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
      
      // Redirect directly to the registration flow for 6 Dominios
      navigate('/dominios', { replace: true });
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
