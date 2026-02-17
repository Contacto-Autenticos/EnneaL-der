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
    const [exchangeRate, setExchangeRate] = useState(1);
    const [localPrice, setLocalPrice] = useState(null);

    const BASE_PRICE_COP = 37000;

    useEffect(() => {
        const init = async () => {
            const data = await getVisitorData();
            setVisitorData(data);

            if (data.currency !== 'COP') {
                const rate = await getExchangeRate(data.currency);
                if (rate) {
                    setExchangeRate(rate);
                    setLocalPrice(BASE_PRICE_COP * rate);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const [diagInfo, setDiagInfo] = useState(null);

    const handleBack = () => {
        navigate('/advanced-intro');
    };

    const handlePay = async () => {
        console.log('Iniciando proceso de pago con Wompi...');
        if (!window.WidgetCheckout) {
            console.error('Librería de Wompi no detectada en window.WidgetCheckout');
            alert('El sistema de pago se está cargando, por favor espera un momento.');
            return;
        }

        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.error('API Keys de Supabase no configuradas');
            alert('Error de configuración: Faltan llaves de Supabase.');
            return;
        }

        setLoading(true);
        try {
            const reference = `ennea_${Date.now()}`;
            const amountInCents = BASE_PRICE_COP * 100;
            let signature = null;

            console.log('Generando pago para:', reference, 'Monto (centavos):', amountInCents);

            // 1. Try to get Integrity Signature
            try {
                console.log('Llamando a Edge Function create-wompi-signature...');
                const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                    body: { reference, amountInCents, currency: 'COP' }
                });

                if (error) {
                    console.error('Error de Supabase Functions:', error);
                    // No cortamos el flujo aquí si estamos en Sandbox, pero lo registramos
                    throw new Error(`Error en firma: ${error.message || JSON.stringify(error)}`);
                }

                console.log('Respuesta cruda de Supabase:', data);

                if (data?.signature) {
                    signature = data.signature;
                    console.log(`✅ Firma recibida (${data._fv || 'v-old'}):`, signature);
                    if (data._debug) {
                        setDiagInfo(data._debug);
                        const d = data._debug;
                        console.log(`🔍 Diagnóstico: Prefijo=${d.prefix}, Largo=${d.length}, Test=${d.isTest}, Prod=${d.isProd}`);
                    } else {
                        console.warn('⚠️ La respuesta no contiene el objeto _debug.');
                    }
                } else {
                    console.warn('⚠️ La respuesta no contiene una firma.');
                }
            } catch (sigErr) {
                console.error('FALLO EN FIRMA:', sigErr);
            }

            // Wompi Public Key - MODO PRUEBA (Sandbox)
            const WOMPI_PUBLIC_KEY = 'pub_test_krxpyuZrgZjZAitMsHHfLbogQie4ddW8';

            console.log('Inicializando Widget de Wompi...');
            const checkout = new window.WidgetCheckout({
                currency: 'COP',
                amountInCents: amountInCents,
                reference: reference,
                publicKey: WOMPI_PUBLIC_KEY,
                signature: signature,
                customerEmail: user?.email,
                redirectUrl: `${window.location.origin}/advanced-intro`,
            });

            console.log('Abriendo modal de Wompi...');
            checkout.open((result) => {
                console.log('Resultado del Widget:', result);
                const transaction = result.transaction;
                if (transaction.status === 'APPROVED') {
                    navigate('/advanced-intro');
                }
            });

        } catch (err) {
            console.error('Error crítico en handlePay:', err);
            const errorStr = String(err);
            let technicalInfo = "";

            // Si el error menciona la firma, intentamos dar más contexto
            if (errorStr.includes("inválida") || errorStr.includes("signature")) {
                const diagMsg = diagInfo
                    ? `\n\n🔍 Datos detectados:\n- Prefijo: ${diagInfo.prefix}\n- Largo: ${diagInfo.length}\n- ¿Es de prueba?: ${diagInfo.isTest ? 'Sí' : 'No'}`
                    : "\n\n⚠️ No se detectaron datos de diagnóstico.";

                technicalInfo = `\n\n💡 Pista: Verifica que el Secreto de Integridad en Supabase coincida con el modo Sandbox.${diagMsg}`;
            }

            alert(`Error al iniciar el pago: ${err.message || errorStr}${technicalInfo}\n\nPor favor, verifica tu conexión o intenta nuevamente.`);
        } finally {
            console.log('Carga finalizada.');
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
