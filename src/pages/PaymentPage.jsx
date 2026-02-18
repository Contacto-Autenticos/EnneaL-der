import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle } from 'lucide-react';
import './PaymentPage.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t'; // User's real public key
const WOMPI_CURRENCY = 'COP';
const BASE_PRICE_IN_CENTS = 1500000; // $15.000 COP

const COUPONS = {
    'ENEAUTOCONOCETE9': 0.50 // 50% discount
};

const PaymentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [error, setError] = useState(null);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [amountInCents, setAmountInCents] = useState(BASE_PRICE_IN_CENTS);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [message, setMessage] = useState(''); // For success or error messages

    const fetchSignature = async (amount) => {
        try {
            setLoading(true);
            const reference = `ref-${Date.now()}`; // Unique reference

            const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                body: { reference, amount: amount, currency: WOMPI_CURRENCY }
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

    useEffect(() => {
        fetchSignature(BASE_PRICE_IN_CENTS);
    }, []);

    const handleApplyCoupon = () => {
        if (!couponCode) return;

        const code = couponCode.trim().toUpperCase();
        const discount = COUPONS[code];

        if (discount) {
            const newAmount = Math.floor(BASE_PRICE_IN_CENTS * (1 - discount));
            setAmountInCents(newAmount);
            setDiscountApplied(true);
            setMessage(`¡Código aplicado! Descuento del ${discount * 100}%`);

            // Re-fetch signature with new amount
            fetchSignature(newAmount);
        } else {
            setMessage('Código no válido');
            setDiscountApplied(false);
            setAmountInCents(BASE_PRICE_IN_CENTS);
            fetchSignature(BASE_PRICE_IN_CENTS);
        }
    };

    useEffect(() => {
        if (signatureData) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.setAttribute('data-render', 'button');
            script.setAttribute('data-public-key', PUBLIC_KEY);
            script.setAttribute('data-currency', WOMPI_CURRENCY);
            script.setAttribute('data-amount-in-cents', amountInCents);
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
                    <div className="payment-row centered-price-column">
                        <div className="payment-original-row">
                            <span className="payment-original-price">Precio normal $37.000</span>
                        </div>
                        <div className="payment-current-row">
                            <span className="payment-amount">
                                ${(amountInCents / 100).toLocaleString('es-CO')} COP
                            </span>
                            {!discountApplied && <span className="payment-offer-tag">y solo por hoy</span>}
                        </div>
                    </div>
                </div>

                <div className="coupon-section">
                    <div className="coupon-input-group">
                        <input
                            type="text"
                            placeholder="Código de descuento"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={discountApplied}
                            className="coupon-input"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={discountApplied || !couponCode}
                            className="btn-apply-coupon"
                        >
                            Aplicar
                        </button>
                    </div>
                    {message && (
                        <p className={`coupon-message ${discountApplied ? 'success' : 'error'}`}>
                            {message}
                        </p>
                    )}
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
