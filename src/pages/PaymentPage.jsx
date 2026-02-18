import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle } from 'lucide-react';
import './PaymentPage.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t'; // User's real public key
const WOMPI_CURRENCY = 'COP';
const WOMPI_AMOUNT_IN_CENTS = 3700000; // $37.000 COP

const PaymentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSignature = async () => {
            try {
                const reference = `ref-${Date.now()}`; // Unique reference

                const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                    body: { reference, amount: WOMPI_AMOUNT_IN_CENTS, currency: WOMPI_CURRENCY }
                });

                if (error) throw error;
                if (data.error) throw new Error(data.error);

                setSignatureData(data);
            } catch (err) {
                console.error('Error fetching signature:', err);
                setError('No pudimos iniciar el proceso de pago. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchSignature();
    }, []);

    useEffect(() => {
        if (signatureData) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.setAttribute('data-render', 'button');
            script.setAttribute('data-public-key', PUBLIC_KEY);
            script.setAttribute('data-currency', WOMPI_CURRENCY);
            script.setAttribute('data-amount-in-cents', WOMPI_AMOUNT_IN_CENTS);
            script.setAttribute('data-reference', signatureData.reference);
            script.setAttribute('data-signature:integrity', signatureData.signature);
            script.setAttribute('data-redirect-url', `${window.location.origin}/payment-status`); // Verify status first

            const container = document.getElementById('wompi-container');
            if (container) {
                container.innerHTML = ''; // Clear previous button if any
                container.appendChild(script);
            }
        }
    }, [signatureData]);

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">Desbloquea tu Informe Avanzado</h1>
                <p className="payment-description">
                    Estás a un paso de descubrir tu perfil auténtico completo.
                </p>
                <div className="payment-summary">
                    <div className="payment-row centered-price">
                        <span className="payment-amount">$37.000 COP</span>
                    </div>
                </div>

                <ul className="features-list">
                    <li><CheckCircle size={18} className="check-icon" /> Acceso vitalicio al informe detallado</li>
                    <li><CheckCircle size={18} className="check-icon" /> Motivaciones centrales</li>
                    <li><CheckCircle size={18} className="check-icon" /> Tu estructura (Tríadas)</li>
                    <li><CheckCircle size={18} className="check-icon" /> Dinámica de crecimiento</li>
                    <li><CheckCircle size={18} className="check-icon" /> Consejos para liderazgo</li>
                </ul>

                {loading && <p>Cargando pasarela de pago...</p>}
                {error && <p className="payment-error">{error}</p>}

                <div id="wompi-container" className="wompi-container">
                    {/* Wompi Button will render here */}
                </div>

                <button onClick={() => navigate('/result')} className="btn-cancel">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
