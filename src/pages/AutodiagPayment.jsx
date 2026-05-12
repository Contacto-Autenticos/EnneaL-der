import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import './PaymentStyles.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';
const WOMPI_CURRENCY = 'COP';
const BASE_PRICE_IN_CENTS = 7500000; // $75.000 COP

const AutodiagPayment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('wompi');
    const [loadingMP, setLoadingMP] = useState(false);
    
    // Currency Conversion State
    const [localCurrency, setLocalCurrency] = useState({ code: 'COP', symbol: '$', rate: 1, country: '' });
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        const fetchLocalCurrency = async () => {
            try {
                setIsConverting(true);
                // 1. Obtener moneda por IP
                const geoRes = await fetch('https://ipapi.co/json/');
                const geoData = await geoRes.json();
                const userCurrency = geoData.currency || 'COP';
                const userCountry = geoData.country_name || '';

                if (userCurrency === 'COP') {
                    setIsConverting(false);
                    return;
                }

                // 2. Obtener tasa de cambio desde COP
                const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/COP`);
                const rateData = await rateRes.json();
                const rate = rateData.rates[userCurrency];

                if (rate) {
                    // Obtener símbolo de moneda
                    const symbol = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: userCurrency,
                    }).format(0).replace(/\d/g, '').replace(/[.,]/g, '').trim();

                    setLocalCurrency({
                        code: userCurrency,
                        symbol: symbol || '$',
                        rate: rate,
                        country: userCountry
                    });
                }
            } catch (err) {
                console.error('Error fetching currency:', err);
            } finally {
                setIsConverting(false);
            }
        };

        fetchLocalCurrency();
    }, []);

    const fetchSignature = async () => {
        try {
            setLoading(true);
            const reference = `ref-autodiag-${Date.now()}`;
            const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                body: { reference, amount: BASE_PRICE_IN_CENTS, currency: WOMPI_CURRENCY }
            });
            if (error) throw error;
            setSignatureData(data);
        } catch (err) {
            console.error('Error fetching signature:', err);
            setError(`Error al iniciar pago: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignature();
    }, []);

    useEffect(() => {
        if (signatureData && paymentMethod === 'wompi') {
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
                                    btn.style.setProperty('background-color', '#00121d', 'important');
                                    btn.style.setProperty('border', '2px solid #ddbe3d', 'important');
                                    btn.style.setProperty('color', 'white', 'important');
                                    btn.style.setProperty('font-weight', '900', 'important');
                                    btn.style.setProperty('text-transform', 'uppercase', 'important');
                                    btn.style.setProperty('letter-spacing', '1px', 'important');
                                    btn.style.setProperty('font-size', '1rem', 'important');
                                    btn.style.setProperty('min-height', '50px', 'important');
                                }
                            }
                        });
                    });
                });
                observer.observe(container, { childList: true, subtree: true });
                return () => observer.disconnect();
            }
        }
    }, [signatureData, paymentMethod]);

    const handleMercadoPago = async () => {
        try {
            setLoadingMP(true);
            setError(null);
            const reference = `ref-mp-autodiag-${Date.now()}`;
            const userEmail = localStorage.getItem('autodiag_user_email') || 'usuario@ejemplo.com';
            
            const { data, error: invokeError } = await supabase.functions.invoke('create-mp-preference', {
                body: { reference, unit_price: 75000, title: "Autodiagnóstico Dominios Fundamentales", user_email: userEmail }
            });

            if (invokeError) throw invokeError;
            if (data?.error) {
                console.error('Error detallado de Mercado Pago:', data);
                throw new Error(data.error);
            }

            if (data?.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error("No se recibió el enlace de pago de Mercado Pago.");
            }
        } catch (err) {
            console.error('Error con Mercado Pago:', err);
            setError(`Error con Mercado Pago: ${err.message}`);
        } finally {
            setLoadingMP(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px', width: '100%' }}>
                    <div className="decorative-line" style={{ height: '2px', flex: 1, background: '#ddbe3d', minWidth: '20px', maxWidth: '60px' }}></div>
                    <h1 className="payment-title" style={{ margin: 0, textAlign: 'center', lineHeight: '0.9', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.6rem', color: '#002e4d', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Autodiagnóstico</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#002e4d' }}>Dominios Fundamentales</span>
                    </h1>
                    <div className="decorative-line" style={{ height: '2px', flex: 1, background: '#ddbe3d', minWidth: '20px', maxWidth: '60px' }}></div>
                </div>
                
                <p className="payment-description" style={{ marginBottom: '30px' }}>
                    <strong style={{ color: '#ddbe3d' }}>Invertir en conocerte es el primer paso.</strong><br />
                    Accede a tu reporte completo y diseña tu mapa de transformación.
                </p>

                <div className="payment-summary dark-theme" style={{ position: 'relative', overflow: 'visible', margin: '20px 0' }}>
                    {/* Estilo para la animación de brillo */}
                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-150%) rotate(45deg); }
                            100% { transform: translateX(150%) rotate(45deg); }
                        }
                    `}</style>

                    {/* Sticker Descuento */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-10px',
                        background: 'linear-gradient(135deg, #ddbe3d 0%, #b89a2d 100%)',
                        color: '#00121d',
                        padding: '12px 18px',
                        borderRadius: '10px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 10,
                        transform: 'rotate(8deg)',
                        overflow: 'hidden'
                    }}>
                        {/* Capa de Brillo */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent)',
                            animation: 'shimmer 2.5s infinite linear',
                        }}></div>

                        <span style={{ fontSize: '1.6rem', fontWeight: '900', lineHeight: '1', position: 'relative' }}>50%</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.2', position: 'relative' }}>Beneficio<br/>Especial</span>
                    </div>

                    <div className="payment-row centered-price-column" style={{ padding: '25px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px' }}>
                        <div className="price-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '100%' }}>
                            <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '1.1rem', color: '#fff', letterSpacing: '1px' }}>
                                Antes {localCurrency.code === 'COP' ? '$150.000' : `${localCurrency.symbol}${Math.round(150000 * localCurrency.rate).toLocaleString()}`}
                            </span>
                            <div className="payment-current-row" style={{ margin: '2px 0' }}>
                                <span className="payment-amount" style={{ color: '#ddbe3d', fontSize: '4.0rem', fontWeight: '900', lineHeight: '1', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                    {localCurrency.code === 'COP' ? '$75.000' : `${localCurrency.symbol}${Math.round(75000 * localCurrency.rate).toLocaleString()}`} 
                                    <span className="currency-label" style={{ color: '#fff', fontSize: '1.3rem', opacity: 0.9, fontWeight: 'bold' }}>{localCurrency.code}</span>
                                </span>
                            </div>
                            {localCurrency.code !== 'COP' && (
                                <p style={{ margin: '-5px 0 10px 0', fontSize: '0.9rem', color: '#ddbe3d', fontWeight: '600' }}>
                                    Valor aproximado · Cobro final en $75.000 COP
                                </p>
                            )}
                            <p style={{ margin: '5px 0 0 0', fontSize: '1.0rem', opacity: 0.9, color: '#fff', fontWeight: '500' }}>Análisis Avanzado · Pago único</p>
                            <p style={{ margin: 0, fontSize: '1.4rem', color: '#ddbe3d', fontWeight: '900', textTransform: 'none', letterSpacing: '0.5px' }}>Precio de lanzamiento</p>

                             {/* Lista de beneficios integrada */}
                             <div style={{ 
                                 display: 'grid', 
                                 gridTemplateColumns: 'repeat(2, 1fr)', 
                                 gap: '12px', 
                                 width: '100%', 
                                 marginTop: '25px',
                                 paddingTop: '20px',
                                 borderTop: '1px solid rgba(255,255,255,0.1)',
                                 textAlign: 'left'
                             }}>
                                 {[
                                     'Análisis profundo de 6 Dimensiones',
                                     'Identificación de áreas críticas',
                                     'Mapa de ecosistema personalizado',
                                     'Hoja de Ruta de 8 Pasos',
                                     'Acceso inmediato e ilimitado',
                                     'Reporte descargable en PDF'
                                 ].map((item, i) => (
                                     <div key={i} style={{ 
                                         display: 'flex', 
                                         alignItems: 'center', 
                                         gap: '8px',
                                         fontSize: '0.8rem',
                                         color: 'rgba(255,255,255,0.9)',
                                         fontWeight: '500'
                                     }}>
                                         <CheckCircle size={14} color="#ddbe3d" /> {item}
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                </div>

                <div className="method-selector" style={{ display: 'flex', gap: '10px', margin: '20px 0', width: '100%' }}>
                    <button className={`method-btn ${paymentMethod === 'wompi' ? 'active' : ''}`} onClick={() => setPaymentMethod('wompi')}
                        style={{ flex: 1, padding: '15px 10px', borderRadius: '8px', border: paymentMethod === 'wompi' ? '2px solid #ddbe3d' : '1px solid #e2e8f0', background: paymentMethod === 'wompi' ? '#00121d' : '#f8fafc', color: paymentMethod === 'wompi' ? '#ddbe3d' : '#64748b', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Opción 1</span>
                        Bancolombia / Tarjeta
                    </button>
                    <button className={`method-btn ${paymentMethod === 'mercadopago' ? 'active' : ''}`} onClick={() => setPaymentMethod('mercadopago')}
                        style={{ flex: 1, padding: '15px 10px', borderRadius: '8px', border: paymentMethod === 'mercadopago' ? '2px solid #009ee3' : '1px solid #e2e8f0', background: paymentMethod === 'mercadopago' ? '#00121d' : '#f8fafc', color: paymentMethod === 'mercadopago' ? '#009ee3' : '#64748b', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Opción 2</span>
                        Mercado Pago
                    </button>
                </div>

                {error && (
                    <div className="payment-error-alert" style={{ 
                        background: '#fee2e2', 
                        color: '#b91c1c', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        marginBottom: '20px', 
                        fontSize: '0.9rem',
                        border: '1px solid #fecaca',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {error}
                    </div>
                )}

                {paymentMethod === 'wompi' ? (
                    <div className="wompi-section fade-in" style={{ width: '100%' }}>
                        <div id="wompi-container" className="wompi-container" style={{ minHeight: '50px', width: '100%' }}>
                            {loading && <p>Preparando pago seguro...</p>}
                        </div>
                        <div className="payment-logos" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', width: '100%' }}>
                            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ height: '24px', width: 'auto' }} />
                            <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" style={{ height: '24px', width: 'auto' }} />
                        </div>
                    </div>
                ) : (
                    <div className="mp-section fade-in" style={{ width: '100%' }}>
                        <button className="btn-mercadopago" onClick={handleMercadoPago} disabled={loadingMP}
                            style={{ width: '100%', minHeight: '50px', background: '#009ee3', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '900', textTransform: 'uppercase', cursor: loadingMP ? 'not-allowed' : 'pointer', opacity: loadingMP ? 0.7 : 1 }}>
                            {loadingMP ? 'Cargando...' : 'Pagar con Mercado Pago'}
                        </button>
                        <div className="payment-logos" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', width: '100%' }}>
                            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" style={{ height: '24px', width: 'auto' }} />
                            <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" style={{ height: '24px', width: 'auto' }} />
                            <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" style={{ height: '24px', width: 'auto' }} />
                        </div>
                    </div>
                )}

                <div className="security-bar" style={{ marginTop: '25px', flexDirection: 'column', gap: '5px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                        Pago seguro procesado por Wompi / Mercado Pago
                    </div>
                    {localCurrency.code !== 'COP' && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            * La transacción final se realizará en Pesos Colombianos (COP) por el valor de $75.000.
                        </span>
                    )}
                </div>

                <button onClick={() => navigate('/hub')} className="btn-cancel" style={{ marginTop: '15px', opacity: 0.6 }}>
                    Volver
                </button>
            </div>
        </div>
    );
};

export default AutodiagPayment;
