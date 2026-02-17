import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getVisitorData, getExchangeRate, formatCurrency } from '../utils/currencyService';
import './PaymentPage.css';

const PaymentPage = ({ user, result }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [visitorData, setVisitorData] = useState({ country: '...', currency: 'COP' });
    const [localPrice, setLocalPrice] = useState(null);

    const BASE_PRICE_COP = 37000;

    useEffect(() => {
        const init = async () => {
            const data = await getVisitorData();
            setVisitorData(data);
            if (data.currency === 'COP') {
                setLocalPrice(BASE_PRICE_COP);
            } else {
                const rate = await getExchangeRate('USD');
                if (rate) {
                    setLocalPrice(Math.round(BASE_PRICE_COP / rate));
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleBack = () => {
        navigate('/advanced-intro');
    };

    const handlePay = async () => {
        if (!window.WidgetCheckout) {
            alert('El sistema de pago se está cargando, por favor espera un momento.');
            return;
        }

        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            alert('Error de configuración del sistema. Por favor intente más tarde.');
            return;
        }

        setLoading(true);
        try {
            const reference = `ennea_${Date.now()}`;
            const amountInCents = BASE_PRICE_COP * 100;
            let signature = null;

            console.log('[Payment Debug] Initiating signature build for:', { reference, amountInCents, currency: 'COP' });

            // 1. Get Integrity Signature from Backend
            try {
                const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                    body: { reference, amountInCents, currency: 'COP' }
                });

                if (error) {
                    console.error('[Payment Debug] Supabase Function Error:', error);
                    throw error;
                }

                if (data?.signature) {
                    signature = data.signature;
                    console.log('[Payment Debug] Signature received successfully');
                } else {
                    console.error('[Payment Debug] No signature in response:', data);
                }
            } catch (sigErr) {
                console.error('[Payment Debug] Error generating signature:', sigErr);
                alert(`Error técnico (Firma): ${sigErr.message || 'Error desconocido'}`);
            }

            // Wompi Production Public Key
            const WOMPI_PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';

            console.log('[Payment Debug] Opening Wompi Widget with Public Key:', WOMPI_PUBLIC_KEY);

            const checkout = new window.WidgetCheckout({
                currency: 'COP',
                amountInCents: amountInCents,
                reference: reference,
                publicKey: WOMPI_PUBLIC_KEY,
                signature: signature,
                customerEmail: user?.email,
                redirectUrl: `${window.location.origin}/advanced-intro`,
            });

            checkout.open((result) => {
                console.log('[Payment Debug] Widget Result:', result);
                const transaction = result.transaction;
                if (transaction.status === 'APPROVED') {
                    navigate('/advanced-intro');
                }
            });

        } catch (err) {
            console.error('[Payment Debug] Top-level payment error:', err);
            alert(`No pudimos iniciar el proceso de pago: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load Wompi script
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="container payment-page">
            <div className="payment-card">
                <button className="btn-back-payment" onClick={handleBack}>
                    <ArrowLeft size={18} /> Regresar
                </button>

                <div className="payment-header">
                    <h1 className="payment-title">Desbloquea tu Informe Avanzado</h1>
                    <p className="payment-subtitle">
                        Obtén el análisis completo de liderazgo personalizado
                    </p>
                </div>

                <div className="price-section">
                    <div className="price-main">
                        {formatCurrency(BASE_PRICE_COP, 'COP')}
                        <span className="price-label">COP</span>
                    </div>

                    {visitorData.currency !== 'COP' && localPrice && (
                        <div className="price-local">
                            <Globe size={16} /> Aproximadamente {formatCurrency(localPrice, visitorData.currency)}
                        </div>
                    )}
                </div>

                <div className="payment-features">
                    <div className="feature-item">
                        <ShieldCheck size={20} className="feature-icon" />
                        <span>Acceso vitalicio al informe detallado</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={20} className="feature-icon" />
                        <span>Motivaciones centrales</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={20} className="feature-icon" />
                        <span>Tu estructura (Tríadas)</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={20} className="feature-icon" />
                        <span>Dinámica de crecimiento</span>
                    </div>
                    <div className="feature-item">
                        <ShieldCheck size={20} className="feature-icon" />
                        <span>Consejos para liderazgo</span>
                    </div>
                </div>

                <div className="wompi-container">
                    <p className="payment-method-hint">Pago seguro procesado por Wompi</p>
                    <button
                        className="btn-pay-now"
                        onClick={handlePay}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Continuar al pago'}
                    </button>
                    <div className="payment-trust-logos">
                        <img
                            src="https://wompi.com/wp-content/uploads/2021/11/Banner-Medios-de-pago.webp"
                            alt="Medios de pago"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                margin: '0 auto',
                                display: 'block',
                                minHeight: '30px'
                            }}
                            onError={(e) => {
                                // Fallback a una imagen genérica si falla la de Wompi
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="payment-footer">
                <img
                    src="/logo-azul.png"
                    alt="Logo Auténticos"
                    className="footer-logo"
                />
            </div>
        </div>
    );
};

export default PaymentPage;
