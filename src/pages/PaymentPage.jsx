import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle } from 'lucide-react';
import './PaymentPage.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t'; // User's real public key
const WOMPI_CURRENCY = 'COP';
const BASE_PRICE_IN_CENTS = 3700000; // $37.000 COP

const COUPONS = {
    'ENEAUTOCONOCETE9': 0.20, // 20% discount
    'CEOB0330': 0.90 // 90% discount
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
    const [showCouponInput, setShowCouponInput] = useState(false);

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
            setError(`Error al iniciar pago: ${err.message || 'Intenta de nuevo'}`);
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
                <h1 className="payment-title">
                    Tu informe avanzado
                </h1>
                <p className="payment-description">
                    Responde el test completo, valida tu tipo y descubre cómo desarrollar todo tu potencial.
                </p>
                <div className="payment-summary">
                    <div className="payment-row centered-price-column">
                        <div className="payment-original-row" style={{ color: '#002d44', textDecoration: 'line-through', fontSize: '1rem', marginBottom: '5px' }}>
                            Precio regular $75.000
                        </div>
                        <div style={{ color: '#002d44', fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px' }}>
                            Valor especial 50% hasta el 30 de marzo del 2026
                        </div>
                        <div className="payment-current-row">
                            <span className="payment-label-investment" style={{ marginRight: '10px', color: '#002d44', fontWeight: 'bold' }}>
                                Inversión actual:
                            </span>
                            <span className="payment-amount">
                                ${(amountInCents / 100).toLocaleString('es-CO')} <span className="currency-label">COP</span>
                            </span>
                        </div>
                        <p className="payment-features-text" style={{ color: '#002d44' }}>Pago único · Acceso vitalicio · Entrega inmediata</p>
                    </div>
                </div>

                <div className="coupon-section">
                    {!showCouponInput && !discountApplied ? (
                        <p
                            className="coupon-toggle-text"
                            onClick={() => setShowCouponInput(true)}
                        >
                            ¿Tienes un código?
                        </p>
                    ) : (
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
                    )}
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

                <div className="security-bar">
                    Pago 100% seguro
                </div>

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
