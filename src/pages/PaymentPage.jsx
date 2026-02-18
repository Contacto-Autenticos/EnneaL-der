import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import './PaymentPage.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';
const WOMPI_CURRENCY = 'COP';
const WOMPI_AMOUNT_IN_CENTS = 3700000; // $37.000 COP

const PaymentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const reference = `ref-${Date.now()}`; // Unique reference

            const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                body: { reference, amount: WOMPI_AMOUNT_IN_CENTS, currency: WOMPI_CURRENCY }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            // Construct Wompi Checkout URL
            const redirectUrl = `${window.location.origin}/advanced-intro`;
            const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${PUBLIC_KEY}&currency=${WOMPI_CURRENCY}&amount-in-cents=${WOMPI_AMOUNT_IN_CENTS}&reference=${reference}&signature:integrity=${data.signature}&redirect-url=${redirectUrl}`;

            // Redirect to Wompi
            window.location.href = checkoutUrl;

        } catch (err) {
            console.error('Error initiating payment:', err);
            setError('No pudimos iniciar el proceso de pago. Intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-card">
                <button className="back-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Regresar
                </button>

                <h1 className="payment-title">Desbloquea tu Informe Avanzado</h1>
                <p className="payment-subtitle">
                    Obtén el análisis completo de liderazgo personalizado
                </p>

                <div className="price-box">
                    <span className="currency-symbol">$</span>
                    <span className="price-amount">37.000</span>
                    <span className="currency-code">COP</span>
                </div>

                <ul className="features-list">
                    <li><CheckCircle size={18} className="check-icon" /> Acceso vitalicio al informe detallado</li>
                    <li><CheckCircle size={18} className="check-icon" /> Motivaciones centrales</li>
                    <li><CheckCircle size={18} className="check-icon" /> Tu estructura (Tríadas)</li>
                    <li><CheckCircle size={18} className="check-icon" /> Dinámica de crecimiento</li>
                    <li><CheckCircle size={18} className="check-icon" /> Consejos para liderazgo</li>
                </ul>

                <div className="security-note">
                    Pago seguro procesado por Wompi
                </div>

                {error && <p className="payment-error text-center">{error}</p>}

                <button
                    className="btn-pay-now"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : 'Continuar al pago'}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
