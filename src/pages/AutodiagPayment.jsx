import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import './PaymentStyles.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';
const WOMPI_CURRENCY = 'COP';
const BASE_PRICE_IN_CENTS = 3600000; // $36.000 COP approx $9 USD

const AutodiagPayment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [error, setError] = useState(null);

    // Multi-currency display is disabled: hardcoded to 9 USD for UI


    const fetchSignature = async () => {
        try {
            setLoading(true);
            const reference = `ref-autodiag-${Date.now()}`;

            const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                body: { reference, amount: BASE_PRICE_IN_CENTS, currency: WOMPI_CURRENCY }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setSignatureData(data);
        } catch (err) {
            console.error('Error fetching signature:', err);
            setError(`Error al iniciar pago: ${err.message || 'Intenta de nuevo'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignature();
    }, []);

    useEffect(() => {
        if (signatureData) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.setAttribute('data-render', 'button');
            script.setAttribute('data-public-key', PUBLIC_KEY);
            script.setAttribute('data-currency', WOMPI_CURRENCY);
            script.setAttribute('data-amount-in-cents', BASE_PRICE_IN_CENTS);
            script.setAttribute('data-reference', signatureData.reference);
            script.setAttribute('data-signature:integrity', signatureData.signature);
            script.setAttribute('data-redirect-url', `${window.location.origin}/dominios-payment-status`);

            const container = document.getElementById('wompi-container');
            if (container) {
                container.innerHTML = ''; 
                container.appendChild(script);

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.tagName === 'FORM' || node.tagName === 'BUTTON' || node.querySelector?.('button')) {
                                const btn = node.tagName === 'BUTTON' ? node : node.querySelector('button');
                                if (btn) {
                                    btn.style.setProperty('width', '100%', 'important');
                                    btn.style.setProperty('border-radius', '6px', 'important');
                                    btn.style.setProperty('background-color', '#0f2234', 'important');
                                    btn.style.setProperty('border', '4px solid #ddbe3d', 'important');
                                    btn.style.setProperty('color', 'white', 'important');
                                    btn.style.setProperty('font-size', '1.35rem', 'important');
                                    btn.style.setProperty('min-height', '60px', 'important');
                                    btn.style.setProperty('box-shadow', '0 6px 15px rgba(0, 0, 0, 0.5)', 'important');
                                }
                            }
                        });
                    });
                });
                observer.observe(container, { childList: true, subtree: true });

                return () => observer.disconnect();
            }
        }
    }, [signatureData]);

    const displayCurrentPrice = '9.00';
    const displayCurrency = 'USD';


    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">
                    Autodiagnóstico
                </h1>
                <p className="payment-description">
                    <strong style={{ color: '#ddbe3d' }}>
                        Invertir en conocerte es el primer paso.
                    </strong><br />
                    Accede a tu rueda de la vida y diseña tu plan de acción.
                </p>
                <div className="payment-summary dark-theme">
                    <div className="payment-row centered-price-column">
                        <div className="payment-current-row">
                            <span className="payment-amount" style={{ color: '#ddbe3d', fontSize: '3rem' }}>
                                ${displayCurrentPrice} <span className="currency-label" style={{ color: '#fff', opacity: 0.8 }}>{displayCurrency}</span>
                            </span>
                        </div>
                        <p className="payment-disclaimer" style={{ fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic', marginTop: '5px', marginBottom: '5px' }}>
                            *El cargo final en tu tarjeta se realiza en COP ($36.000 internamente).
                        </p>

                        <p className="payment-features-text" style={{ color: '#fff', opacity: 0.9 }}>
                            Autodiagnóstico de 6 dimensiones · Pago único
                        </p>
                    </div>
                </div>

                <div className="payment-benefits-list" style={{ textAlign: 'left', margin: '25px auto', maxWidth: '400px', width: '100%', padding: '0 10px' }}>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0, 
                        color: '#333', 
                        fontSize: '1.05rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '15px 20px'
                    }}>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#ddbe3d" style={{ marginRight: '10px', minWidth: '20px' }} />
                            <span>Perfil emocional</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#ddbe3d" style={{ marginRight: '10px', minWidth: '20px' }} />
                            <span>Punto crítico</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#ddbe3d" style={{ marginRight: '10px', minWidth: '20px' }} />
                            <span>Recomendaciones</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#ddbe3d" style={{ marginRight: '10px', minWidth: '20px' }} />
                            <span>Plan de acción</span>
                        </li>
                    </ul>
                </div>

                {loading && <p style={{ marginTop: '20px' }}>Cargando pasarela de pago...</p>}
                {error && <p className="payment-error">{error}</p>}

                <div id="wompi-container" className="wompi-container">
                    {/* Wompi Button will render here */}
                </div>

                <div className="security-bar">
                    <ShieldCheck size={20} style={{ marginRight: '8px' }} />
                    Compra 100% segura
                </div>

                <button onClick={() => navigate('/hub')} className="btn-cancel">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default AutodiagPayment;
