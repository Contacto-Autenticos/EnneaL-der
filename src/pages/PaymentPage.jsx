import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import './PaymentStyles.css'; // Renamed to force cache refresh

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

    // Multi-currency state
    const [userCountry, setUserCountry] = useState('CO');
    const [localCurrency, setLocalCurrency] = useState('COP');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);

    useEffect(() => {
        const detectLocationAndCurrency = async () => {
            try {
                // 1. Detect Country and Currency
                const locationRes = await fetch('https://ipapi.co/json/');
                const locationData = await locationRes.json();

                const country = locationData.country_code || 'CO';
                const currency = locationData.currency || 'COP';

                setUserCountry(country);
                setLocalCurrency(currency);

                // 2. Fetch Exchange Rate if not COP
                if (currency !== 'COP') {
                    // Get rates relative to COP
                    const rateRes = await fetch('https://open.er-api.com/v6/latest/COP');
                    const rateData = await rateRes.json();

                    if (rateData && rateData.rates && rateData.rates[currency]) {
                        setExchangeRate(rateData.rates[currency]);
                    }
                }
            } catch (error) {
                console.error('Error detecting location/currency:', error);
                // Fallback to COP is already set in initial state
            } finally {
                setIsLoadingCurrency(false);
            }
        };

        detectLocationAndCurrency();
    }, []);

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

                // Force styles via Observer in case CSS is overridden or shadow DOM is used (if open)
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

                // Cleanup observer
                return () => observer.disconnect();
            }
        }
    }, [signatureData]);

    const isInternational = userCountry !== 'CO' && localCurrency !== 'COP' && exchangeRate !== 1;
    const currentPriceCOP = amountInCents / 100;
    const originalPriceCOP = 74000;

    const displayCurrentPrice = isInternational
        ? (currentPriceCOP * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : currentPriceCOP.toLocaleString('es-CO');

    const displayOriginalPrice = isInternational
        ? (originalPriceCOP * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : originalPriceCOP.toLocaleString('es-CO');

    const displayCurrency = isInternational ? localCurrency : 'COP';

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">
                    Informe avanzado
                </h1>
                <p className="payment-description">
                    <strong style={{ color: '#ddbe3d' }}>Invertir en conocerte es un acto de liderazgo.</strong><br />
                    Realiza ahora el análisis avanzado y obtén un resultado con mayor claridad.
                </p>
                <div className="payment-summary dark-theme">
                    <div className="discount-badge">
                        <span className="discount-percentage">50%</span>
                        <span className="discount-label">BENEFICIO<br />ESPECIAL</span>
                    </div>
                    <div className="payment-row centered-price-column">
                        <div className="payment-original-row">
                            Antes ${displayOriginalPrice} {isInternational && displayCurrency}
                        </div>

                        <div className="payment-current-row">
                            <span className="payment-amount" style={{ color: '#ddbe3d', fontSize: '3rem' }}>
                                ${displayCurrentPrice} <span className="currency-label" style={{ color: '#fff', opacity: 0.8 }}>{displayCurrency}</span>
                            </span>
                        </div>
                        {isInternational && (
                            <p className="payment-disclaimer" style={{ fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic', marginTop: '5px', marginBottom: '5px' }}>
                                *El cargo final será en COP. Valor aprox.
                            </p>
                        )}
                        <p className="payment-features-text" style={{ color: '#fff', opacity: 0.9 }}>Pago único · Acceso vitalicio · Entrega inmediata</p>

                        <div className="savings-text">
                            Precio de lanzamiento
                        </div>
                    </div>
                </div>

                <p className="payment-validity-note">
                    Valor especial válido hasta el 30 de marzo del 2026
                </p>

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
                    <li><CheckCircle size={18} className="check-icon" /> Detalles de tu personalidad</li>
                    <li><CheckCircle size={18} className="check-icon" /> Reconoce tus miedos y deseos</li>
                    <li><CheckCircle size={18} className="check-icon" /> Dinámicas de crecimiento</li>
                    <li><CheckCircle size={18} className="check-icon" /> Formas de tomar decisiones</li>
                    <li><CheckCircle size={18} className="check-icon" /> Entiende cómo actúas bajo presión</li>
                    <li><CheckCircle size={18} className="check-icon" /> Consejos para aprovechar tu tipo</li>
                    <li><CheckCircle size={18} className="check-icon" /> Pasiones y virtudes</li>
                    <li><CheckCircle size={18} className="check-icon" /> Y mucho más…</li>
                </ul>

                {loading && <p>Cargando pasarela de pago...</p>}
                {error && <p className="payment-error">{error}</p>}

                <div id="wompi-container" className="wompi-container">
                    {/* Wompi Button will render here */}
                </div>

                {/* Security bar added back as requested */}
                <div className="security-bar">
                    <ShieldCheck size={20} style={{ marginRight: '8px' }} />
                    Compra 100% segura
                </div>

                <button onClick={() => navigate('/result')} className="btn-cancel">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
