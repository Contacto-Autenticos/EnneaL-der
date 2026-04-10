import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import './PaymentStyles.css'; // Renamed to force cache refresh

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t'; // User's real public key
const WOMPI_CURRENCY = 'COP';
const BASE_PRICE_IN_CENTS = 7500000; // $75.000 COP

// Hardcoded coupons removed, now using database

const PaymentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [error, setError] = useState(null);

    // Mode detection
    const queryParams = new URLSearchParams(window.location.search);
    const isPlanOnly = queryParams.get('mode') === 'plan';
    const PLAN_ONLY_PRICE = 1500000; // $15.000 COP
    const BASE_PRICE = isPlanOnly ? PLAN_ONLY_PRICE : BASE_PRICE_IN_CENTS;

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [amountInCents, setAmountInCents] = useState(isPlanOnly ? PLAN_ONLY_PRICE : BASE_PRICE_IN_CENTS);
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

    // Simplified effect: We only need to fetch signature when the amount changes.
    // Initial fetch is handled by the useEffect watching [amountInCents, bumpSelected].

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setMessage('Validando...');

        const code = couponCode.trim().toUpperCase();

        try {
            // 1. Check in regular coupons
            console.log('Buscando cupón:', code);
            const { data: coupon, error: couponError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code)
                .eq('is_active', true)
                .maybeSingle();

            if (coupon) {
                console.log('Cupón encontrado:', coupon);
                const discount = coupon.discount_percentage / 100;
                const newAmount = Math.floor(BASE_PRICE * (1 - discount));
                setAmountInCents(newAmount);
                setDiscountApplied(true);
                setMessage(`¡Código aplicado! Descuento del ${coupon.discount_percentage}%`);
                localStorage.removeItem('activeCommercial');
                // No need to fetchSignature here, the [amountInCents, bumpSelected] effect will handle it
                return;
            }

            // 2. If not found, check in affiliate_codes
            console.log('No es cupón regular, buscando en afiliados:', code);
            const { data: affiliate, error: affiliateError } = await supabase
                .from('affiliate_codes')
                .select('*')
                .eq('code', code)
                .eq('is_active', true)
                .maybeSingle();

            if (affiliate) {
                console.log('Afiliado encontrado:', affiliate);
                const discount = affiliate.discount_percentage / 100;
                const newAmount = Math.floor(BASE_PRICE * (1 - discount));
                setAmountInCents(newAmount);
                setDiscountApplied(true);
                setAmountInCents(newAmount);
                setMessage(`¡Código de afiliado aplicado! (${affiliate.commercial_name})`);
                
                // Store commercial name to attribute the sale later
                localStorage.setItem('activeCommercial', affiliate.commercial_name);
                
                // No need to fetchSignature here
            } else {
                console.log('Código no encontrado en ninguna tabla');
                if (affiliateError) console.error('Error en búsqueda de afiliado:', affiliateError);
                setMessage('Código no válido o expirado');
                setDiscountApplied(false);
                setAmountInCents(BASE_PRICE);
                localStorage.removeItem('activeCommercial');
            }
        } catch (err) {
            console.error('Error crítico aplicando cupón/afiliado:', err);
            setMessage('Error al validar código');
        }
    };

    useEffect(() => {
        if (signatureData) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.setAttribute('data-render', 'button');
            script.setAttribute('data-public-key', PUBLIC_KEY);
            script.setAttribute('data-currency', WOMPI_CURRENCY);
            // Use finalAmount from signatureData or calculate it here. 
            // In creation of signature we sent the final amount, so signatureData.amount should have it.
            // But to be 100% sure we use the same calculation as when fetching signature:
            script.setAttribute('data-amount-in-cents', getFinalAmount(amountInCents, bumpSelected));
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

    // Order Bump state
    const [bumpSelected, setBumpSelected] = useState(false);
    const BUMP_PRICE_IN_CENTS = 1500000; // $15.000 COP

    const getFinalAmount = (currentBaseAmount, bumpIsSelected) => {
        return bumpIsSelected ? currentBaseAmount + BUMP_PRICE_IN_CENTS : currentBaseAmount;
    };

    useEffect(() => {
        const finalAmount = getFinalAmount(amountInCents, bumpSelected);
        fetchSignature(finalAmount);
    }, [amountInCents, bumpSelected]);

    const isInternational = userCountry !== 'CO' && localCurrency !== 'COP' && exchangeRate !== 1;
    const currentPriceBaseCOP = amountInCents / 100;
    const bumpPriceCOP = BUMP_PRICE_IN_CENTS / 100;
    const totalAmountCOP = (getFinalAmount(amountInCents, bumpSelected)) / 100;
    const originalPriceCOP = isPlanOnly ? 30000 : 150000;

    const displayCurrentPrice = isInternational
        ? (totalAmountCOP * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : totalAmountCOP.toLocaleString('es-CO');

    const displayOriginalPrice = isInternational
        ? (originalPriceCOP * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : originalPriceCOP.toLocaleString('es-CO');

    const displayCurrency = isInternational ? localCurrency : 'COP';

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1 className="payment-title">
                    {isPlanOnly ? 'Plan de Acción' : 'Informe avanzado'}
                </h1>
                <p className="payment-description">
                    <strong style={{ color: '#ddbe3d' }}>
                        {isPlanOnly ? 'Transforma tu conocimiento en resultados tangibles.' : 'Invertir en conocerte es un acto de liderazgo.'}
                    </strong><br />
                    {isPlanOnly 
                        ? 'Obtén tu guía personalizada de implementación de 30 días.' 
                        : 'Realiza ahora el análisis avanzado y obtén un resultado con mayor claridad.'}
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
                        <p className="payment-features-text" style={{ color: '#fff', opacity: 0.9 }}>
                            {isPlanOnly ? 'Plan de Acción Estratégico' : (bumpSelected ? 'Análisis Avanzado + Plan de Acción' : 'Análisis Avanzado')} · Pago único
                        </p>

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
                            ¿Tienes un código de descuento?
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
                    {isPlanOnly ? (
                        <>
                            <li><CheckCircle size={18} className="check-icon" /> Plan de 30 días</li>
                            <li><CheckCircle size={18} className="check-icon" /> Matriz de decisiones</li>
                            <li><CheckCircle size={18} className="check-icon" /> Protocolo bajo presión</li>
                            <li><CheckCircle size={18} className="check-icon" /> Guía de conversaciones</li>
                            <li><CheckCircle size={18} className="check-icon" /> Planificación estratégica</li>
                            <li><CheckCircle size={18} className="check-icon" /> Acciones por eneatipo</li>
                            <li><CheckCircle size={18} className="check-icon" /> Roadmap de crecimiento</li>
                            <li><CheckCircle size={18} className="check-icon" /> Y mucho más…</li>
                        </>
                    ) : (
                        <>
                            <li><CheckCircle size={18} className="check-icon" /> Detalles de tu personalidad</li>
                            <li><CheckCircle size={18} className="check-icon" /> Reconoce tus miedos y deseos</li>
                            <li><CheckCircle size={18} className="check-icon" /> Dinámicas de crecimiento</li>
                            <li><CheckCircle size={18} className="check-icon" /> Formas de tomar decisiones</li>
                            <li><CheckCircle size={18} className="check-icon" /> Entiende cómo actúas bajo presión</li>
                            <li><CheckCircle size={18} className="check-icon" /> Consejos para aprovechar tu tipo</li>
                            <li><CheckCircle size={18} className="check-icon" /> Pasiones y virtudes</li>
                            <li><CheckCircle size={18} className="check-icon" /> Y mucho más…</li>
                        </>
                    )}
                </ul>

                {/* PREMIUM ORDER BUMP SECTION - Only show if not plan only */}
                {!isPlanOnly && (
                    <div className="order-bump-container">
                    <div className="order-bump-header-image">
                        <img src="/Portada - Plan de Acción-1.jpg" alt="Executive Kit Mockup" className="order-bump-full-image" />
                        <div className="order-bump-badge">OPCIONAL PLAN DE ACCIÓN</div>
                    </div>

                    <div className="order-bump-content">
                        <h2 className="order-bump-title">Convierte tu resultado en un Plan de Acción</h2>
                        <p className="order-bump-subtitle">Aplica tu resultado en decisiones estratégicas concretas</p>

                        <div className="order-bump-divider"></div>

                        <ul className="order-bump-benefits">
                            <li><span>✔</span> Plan de implementación de 30 días</li>
                            <li><span>✔</span> Matriz de decisiones estratégicas</li>
                            <li><span>✔</span> Protocolo bajo presión</li>
                            <li><span>✔</span> Guia para conversaciones difíciles</li>
                        </ul>

                        <div className="order-bump-pricing-area">
                            <span className="order-bump-old-price">${isInternational ? (30000 * exchangeRate).toLocaleString() : '30.000'}</span>
                            <div className="order-bump-current-price-row">
                                <span className="order-bump-new-price">
                                    ${isInternational ? (15000 * exchangeRate).toLocaleString() : '15.000'}
                                </span>
                                <span className="order-bump-currency-white">COP</span>
                            </div>
                        </div>
                        <p className="order-bump-price-bottom-note">Pago único · Acceso inmediato</p>
                    </div>

                    <div className="order-bump-action-area">
                        <label className="order-bump-checkbox-label">
                            <input
                                type="checkbox"
                                checked={bumpSelected}
                                onChange={(e) => {
                                    setBumpSelected(e.target.checked);
                                    localStorage.setItem('pendingBumpPurchase', e.target.checked.toString());
                                }}
                                className="order-bump-checkbox"
                            />
                            <div className="order-bump-checkbox-custom"></div>
                            <div className="order-bump-action-text">
                                <span className="order-bump-action-main">Sí, agregar mi Plan de Acción</span>
                                <span className="order-bump-action-sub">Descarga inmediata en PDF al finalizar el analisis avanzado</span>
                            </div>
                        </label>
                    </div>
                </div>
                )}

                {loading && <p style={{ marginTop: '20px' }}>Cargando pasarela de pago...</p>}
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
