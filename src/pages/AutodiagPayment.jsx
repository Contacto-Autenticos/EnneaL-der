import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Check
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import './EnesenciaCheckout.css';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-3b961bcb-9278-4e21-bcb4-1d04539cb2da';

try {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-CO' });
} catch (e) {
  console.warn('MercadoPago init error:', e);
}

const StablePaymentBrick = React.memo(({ amount, userEmail, onSubmit, onError }) => {
  const initialization = useMemo(() => ({
    amount: Math.round(Number(amount)),
    payer: {
      email: userEmail || '',
    }
  }), [amount, userEmail]);

  const customization = useMemo(() => ({
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
      bankTransfer: 'all'
    },
    visual: {
      hideFormTitle: true,
      style: {
        theme: 'default',
        customVariables: {
          baseColor: '#DDBE3D',
          baseColorFirstVariant: '#C9AB33',
          baseColorSecondVariant: '#B5982A',
          buttonTextColor: '#002D44',
          borderRadiusMedium: '14px',
          borderRadiusLarge: '14px'
        }
      }
    }
  }), []);

  if (!amount || isNaN(amount) || amount <= 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
        <span>Preparando pasarela de pago seguro...</span>
      </div>
    );
  }

  return (
    <Payment
      initialization={initialization}
      customization={customization}
      onSubmit={onSubmit}
      onError={onError}
    />
  );
});

const CheckoutFloatingField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  inputMode,
  enterKeyHint,
  onKeyDown,
  inputRef
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && String(value).length > 0);
  const isFloated = isFocused || hasValue;

  return (
    <div className={`enes-checkout-field-wrapper ${isFocused ? 'is-focused' : ''}`}>
      <label
        htmlFor={id || name}
        className={`enes-checkout-field-label ${isFloated ? 'is-floated' : ''}`}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id || name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        onKeyDown={onKeyDown}
        className="enes-checkout-field-input"
      />
    </div>
  );
};

export default function AutodiagPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const BASE_PRICE_COP = 75000;
  const REGULAR_PRICE_COP = 150000;

  // Precargar usuario registrado en /dominios (tempAutodiagUser)
  const storedAutodiagUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('tempAutodiagUser');
      if (raw && raw !== 'undefined') return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const [formData, setFormData] = useState({
    full_name: searchParams.get('name') || storedAutodiagUser?.name || '',
    email: searchParams.get('email') || storedAutodiagUser?.email || localStorage.getItem('autodiag_user_email') || ''
  });

  const emailInputRef = useRef(null);

  // Cupón
  const initialCouponParam = searchParams.get('coupon') || searchParams.get('cupon') || '';
  const [showCouponInput, setShowCouponInput] = useState(Boolean(initialCouponParam));
  const [couponInput, setCouponInput] = useState(initialCouponParam);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [isSubmittingBrick, setIsSubmittingBrick] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const discountPct = appliedCoupon ? Number(appliedCoupon.discountPercentage || 0) : 0;
  const finalAmountCOP = Math.floor(BASE_PRICE_COP * (1 - discountPct / 100));
  const isFree = finalAmountCOP <= 0;

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val);

  const validateCouponOnServer = useCallback(async (rawCode) => {
    const cleanCode = String(rawCode || '').trim().toUpperCase();
    if (!cleanCode) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: 'error', text: 'Escribe un código de descuento para aplicarlo.' });
      return;
    }

    setValidatingCoupon(true);
    setCouponFeedback(null);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('enesencia-process-payment', {
        body: {
          action: 'validate_coupon',
          flow: 'dominios',
          couponCode: cleanCode
        }
      });

      if (error || !data?.ok || !data.valid) {
        setAppliedCoupon(null);
        setCouponFeedback({
          type: 'error',
          text: data?.error || 'Código no válido o expirado.'
        });
        return;
      }

      setAppliedCoupon({
        code: data.code,
        discountPercentage: Number(data.discountPercentage),
        label: data.label
      });
      setCouponFeedback({ type: 'success', text: data.label });
    } catch {
      setAppliedCoupon(null);
      setCouponFeedback({ type: 'error', text: 'Error al validar el código en el servidor.' });
    } finally {
      setValidatingCoupon(false);
    }
  }, []);

  useEffect(() => {
    if (initialCouponParam && !appliedCoupon) {
      validateCouponOnServer(initialCouponParam);
    }
  }, [initialCouponParam, appliedCoupon, validateCouponOnServer]);

  const handleClearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const triggerSuccessConfetti = () => {
    try {
      import('canvas-confetti').then((module) => {
        const confetti = module.default || module;
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      });
    } catch {}
  };

  const finalizeDominiosAccess = useCallback((paidAmount) => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.full_name.trim() || storedAutodiagUser?.name || 'Participante';

    // 1. Asegurar tempAutodiagUser y autodiagPaid en localStorage (requeridos por /dominios-intro)
    const userPayload = {
      name: cleanName,
      email: cleanEmail,
      birth_date: storedAutodiagUser?.birth_date || '1990-01-01'
    };
    localStorage.setItem('tempAutodiagUser', JSON.stringify(userPayload));
    localStorage.setItem('autodiagPaid', 'true');

    // 2. Meta Pixel Purchase
    if (window.fbq && paidAmount > 0) {
      window.fbq('track', 'Purchase', {
        currency: 'COP',
        value: paidAmount,
        content_name: 'Autodiagnóstico de Dominios'
      });
    }

    // 3. Redirigir a /dominios-intro
    setTimeout(() => {
      navigate('/dominios-intro');
    }, 1800);
  }, [formData, storedAutodiagUser, navigate]);

  const handleFreeRedeem = async () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.full_name.trim();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor completa tu Nombre y Correo Electrónico en el Paso 1.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmittingBrick(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('enesencia-process-payment', {
        body: {
          action: 'redeem_free',
          flow: 'dominios',
          couponCode: appliedCoupon?.code || couponInput,
          customerEmail: cleanEmail,
          customerName: cleanName
        }
      });

      if (error || !data?.ok) {
        throw new Error(data?.error || error?.message || 'No fue posible aplicar el cupón.');
      }

      setIsSubmittingBrick(false);
      triggerSuccessConfetti();
      setPaymentResult({
        status: 'approved',
        id: data.id,
        title: '¡Acceso Habilitado con Éxito!',
        message: 'Tu acceso al Autodiagnóstico de 6 Dominios Fundamentales está listo.',
        amountPaid: 0
      });
      finalizeDominiosAccess(0);
    } catch (err) {
      setIsSubmittingBrick(false);
      setErrorMessage(err.message);
    }
  };

  const handleBrickSubmit = useCallback(async ({ formData: brickFormData }) => {
    setIsSubmittingBrick(true);
    setErrorMessage(null);

    return new Promise(async (resolve, reject) => {
      try {
        const cleanEmail = (formData.email || brickFormData?.payer?.email || '').trim().toLowerCase();
        const cleanName = formData.full_name.trim() || storedAutodiagUser?.name || 'Participante Auténticos';

        if (!cleanEmail || !cleanEmail.includes('@')) {
          const msg = 'Por favor ingresa tu Correo Electrónico en el Paso 1 antes de pagar.';
          setErrorMessage(msg);
          setIsSubmittingBrick(false);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          reject(new Error(msg));
          return;
        }

        const { data, error } = await supabase.functions.invoke('enesencia-process-payment', {
          body: {
            action: 'pay',
            flow: 'dominios',
            couponCode: appliedCoupon?.code || '',
            customerEmail: cleanEmail,
            customerName: cleanName,
            birthDate: storedAutodiagUser?.birth_date || null,
            formData: brickFormData
          }
        });

        if (error) {
          let serverMsg = error.message;
          try {
            if (error.context && typeof error.context.json === 'function') {
              const errBody = await error.context.json();
              if (errBody?.error) serverMsg = errBody.error;
            }
          } catch {}
          throw new Error(serverMsg || 'Error en el servidor al procesar el pago.');
        }

        if (!data || data.error) {
          throw new Error(data?.error || 'No se pudo confirmar la transacción.');
        }

        setIsSubmittingBrick(false);

        if (data.status === 'approved') {
          triggerSuccessConfetti();
          const paidAmount = Number(data.transaction_amount || finalAmountCOP);

          setPaymentResult({
            status: 'approved',
            id: data.id,
            title: '¡Pago Aprobado con Éxito!',
            message: 'Tu acceso al Autodiagnóstico de 6 Dominios Fundamentales ha sido confirmado.',
            amountPaid: paidAmount
          });

          finalizeDominiosAccess(paidAmount);
          resolve();
        } else if (data.status === 'pending' || data.status === 'in_process') {
          const redirectUrl = data.transaction_details?.external_resource_url;
          setPaymentResult({
            status: 'pending',
            id: data.id,
            title: 'Pago Pendiente de Confirmación',
            message: redirectUrl
              ? 'Por favor completa el pago a través de tu entidad bancaria (PSE / Efecty / Banco).'
              : 'Estamos procesando tu pago. Te notificaremos en cuanto el banco lo confirme.',
            redirectUrl,
            amountPaid: Number(data.transaction_amount || finalAmountCOP)
          });
          resolve();
        } else {
          const detailMsg = data.status_detail ? ` (${data.status_detail})` : '';
          throw new Error(`El pago fue rechazado por el banco o pasarela${detailMsg}. Por favor intenta con otra tarjeta o medio.`);
        }
      } catch (err) {
        console.error('Error al procesar pago Dominios:', err);
        setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar el pago.');
        setIsSubmittingBrick(false);
        reject(err);
      }
    });
  }, [formData, storedAutodiagUser, appliedCoupon, finalAmountCOP, finalizeDominiosAccess]);

  const handleBrickError = useCallback((error) => {
    console.error('Error en el SDK de Mercado Pago:', error);
  }, []);

  const featuresList = [
    'Análisis profundo de los 6 Dominios Fundamentales',
    'Identificación de áreas críticas y fortalezas actuales',
    'Mapa de ecosistema personalizado según la metodología MLT',
    'Hoja de Ruta de 8 Pasos y reporte descargable en PDF'
  ];

  return (
    <div className="enes-checkout-wrapper">
      {/* Header Banner Azul con Logo Blanco de Auténticos */}
      <header className="enes-checkout-header">
        <div className="enes-checkout-header-inner">
          <button
            type="button"
            onClick={() => navigate('/dominios')}
            className="enes-checkout-back-link"
            title="Volver"
            aria-label="Volver"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="enes-checkout-header-brand">
            <img src="/Logo-Blanco.png" alt="Auténticos" className="enes-checkout-header-logo" />
          </div>

          <div className="enes-checkout-header-spacer" aria-hidden="true" />
        </div>
      </header>

      <main className="enes-checkout-main">
        <div className="enes-checkout-grid">

          {/* Columna Izquierda: Paso 1 (Datos) y Paso 2 (Pasarela de Pago) */}
          <section className="enes-checkout-form-card">
            {paymentResult ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: paymentResult.status === 'approved' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.15)',
                  color: paymentResult.status === 'approved' ? '#16A34A' : '#CA8A04',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto'
                }}>
                  <CheckCircle2 size={42} />
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002D44', marginBottom: '8px' }}>
                  {paymentResult.title}
                </h2>

                <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '400px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                  {paymentResult.message}
                </p>

                {paymentResult.redirectUrl && (
                  <a
                    href={paymentResult.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="enes-checkout-cta-btn"
                    style={{ textDecoration: 'none', marginBottom: '20px' }}
                  >
                    <span>Completar Pago en mi Banco (PSE / Efecty)</span>
                    <ArrowRight size={18} />
                  </a>
                )}

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Producto:</span>
                    <strong style={{ color: '#002D44' }}>Autodiagnóstico 6 Dominios Fundamentales</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Correo:</span>
                    <strong style={{ color: '#002D44' }}>{formData.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Total:</span>
                    <strong style={{ color: '#16A34A' }}>${formatCOP(paymentResult.amountPaid)} COP</strong>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#991B1B',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>No se pudo procesar:</strong>
                      <div style={{ marginTop: '2px' }}>{errorMessage}</div>
                    </div>
                  </div>
                )}

                {/* PASO 1: DATOS */}
                <div className="enes-checkout-step1-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="enes-checkout-step-num">1</span>
                    <h3 className="enes-checkout-form-title" style={{ margin: 0 }}>Tus Datos</h3>
                  </div>
                  <p className="enes-checkout-form-subtitle">
                    Confirma tu nombre y correo para personalizar tu reporte de 6 Dominios.
                  </p>

                  <div className="enes-checkout-fields-stack">
                    <CheckoutFloatingField
                      id="dom-chk-name"
                      name="full_name"
                      label="Nombre Completo *"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      autoComplete="name"
                      enterKeyHint="next"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          emailInputRef.current?.focus();
                        }
                      }}
                    />

                    <CheckoutFloatingField
                      id="dom-chk-email"
                      name="email"
                      label="Correo Electrónico *"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="done"
                      inputRef={emailInputRef}
                    />
                  </div>
                </div>

                {/* PASO 2: PAGO */}
                <div className="enes-checkout-step2-section" style={{
                  marginTop: '28px',
                  paddingTop: '24px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="enes-checkout-step-num">2</span>
                    <h3 className="enes-checkout-form-title" style={{ margin: 0 }}>Pago</h3>
                  </div>
                  <p className="enes-checkout-form-subtitle">
                    Selecciona tu medio preferido.
                  </p>

                  {isFree ? (
                    <button
                      type="button"
                      onClick={handleFreeRedeem}
                      disabled={isSubmittingBrick}
                      className="enes-checkout-cta-btn is-free"
                    >
                      {isSubmittingBrick ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Habilitando acceso...</span>
                        </>
                      ) : (
                        <>
                          <span>Comenzar Autodiagnóstico con Cupón 100%</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="enes-checkout-brick-container">
                      {isSubmittingBrick && (
                        <div className="enes-checkout-brick-overlay">
                          <Loader2 size={38} className="animate-spin" color="#002D44" />
                          <span style={{ fontWeight: 800, color: '#002D44', fontSize: '1rem' }}>
                            Procesando pago de forma segura...
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                            Por favor no cierres ni recargues esta ventana.
                          </span>
                        </div>
                      )}

                      <StablePaymentBrick
                        amount={finalAmountCOP}
                        userEmail={formData.email}
                        onSubmit={handleBrickSubmit}
                        onError={handleBrickError}
                      />
                    </div>
                  )}
                </div>

                {/* Sellos de Confianza */}
                <div className="enes-checkout-trust-badges">
                  <div className="enes-checkout-trust-title">
                    <ShieldCheck size={16} />
                    <span>PAGO 100% PROTEGIDO Y ENCRIPTADO</span>
                  </div>
                  <div className="enes-checkout-trust-logos">
                    <img src="/visa.png" alt="Visa" />
                    <img src="/mastercard.png" alt="Mastercard" />
                    <img src="/mercadopago.png" alt="Mercado Pago" />
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Columna Derecha: Resumen de Pedido */}
          <section className="enes-checkout-summary-card">
            <div className="enes-checkout-product-header">
              <img
                src="/Radar-2.png"
                alt="6 Dominios Fundamentales"
                className="enes-checkout-product-thumb"
                onError={(e) => { e.currentTarget.src = '/Isotipo-Brujula-MLT.webp'; }}
              />
              <div className="enes-checkout-product-info">
                <span className="enes-checkout-product-tag">Autodiagnóstico Oficial</span>
                <h2 className="enes-checkout-product-name">6 Dominios Fundamentales</h2>
              </div>
            </div>

            <ul className="enes-checkout-benefits-list">
              {featuresList.map((feat, idx) => (
                <li key={idx} className="enes-checkout-benefit-item">
                  <span className="enes-checkout-benefit-icon">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="enes-checkout-pricing-breakdown">
              <div className="enes-checkout-price-row">
                <span>Precio regular</span>
                <span style={{ textDecoration: 'line-through' }}>${formatCOP(REGULAR_PRICE_COP)} COP</span>
              </div>

              <div className="enes-checkout-price-row" style={{ color: '#059669' }}>
                <span>Beneficio Especial (-50%)</span>
                <span>-${formatCOP(REGULAR_PRICE_COP - BASE_PRICE_COP)} COP</span>
              </div>

              {appliedCoupon && (
                <div className="enes-checkout-price-row" style={{ color: '#059669' }}>
                  <span>Descuento {appliedCoupon.code} (-{appliedCoupon.discountPercentage}%)</span>
                  <span>-${formatCOP(BASE_PRICE_COP - finalAmountCOP)} COP</span>
                </div>
              )}

              <div className="enes-checkout-price-row is-total">
                <span className="enes-checkout-total-title">Total a pagar hoy:</span>
                <div className="enes-checkout-total-value">
                  <div className="enes-checkout-total-cop-main">
                    ${formatCOP(finalAmountCOP)} <span>COP</span>
                  </div>
                  <div className="enes-checkout-total-sub">
                    Pago único • Acceso inmediato
                  </div>
                </div>
              </div>
            </div>

            {/* Caja de Cupón */}
            <div className="enes-checkout-coupon-box">
              {!appliedCoupon ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="enes-checkout-coupon-trigger"
                  >
                    <Tag size={14} color="#856B18" />
                    <span>{showCouponInput ? 'Ocultar código de descuento' : '¿Tienes un código de descuento?'}</span>
                  </button>

                  {showCouponInput && (
                    <div className="enes-checkout-coupon-form">
                      <input
                        type="text"
                        value={couponInput}
                        disabled={validatingCoupon}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            validateCouponOnServer(couponInput);
                          }
                        }}
                        placeholder="Ingresa tu código"
                        className="enes-checkout-coupon-input"
                      />
                      <button
                        type="button"
                        onClick={() => validateCouponOnServer(couponInput)}
                        disabled={validatingCoupon || !couponInput.trim()}
                        className="enes-checkout-coupon-btn"
                      >
                        {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="enes-checkout-coupon-applied">
                  <span>✓ {appliedCoupon.label}</span>
                  <button
                    type="button"
                    onClick={handleClearCoupon}
                    className="enes-checkout-coupon-remove"
                  >
                    Quitar
                  </button>
                </div>
              )}

              {couponFeedback && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: couponFeedback.type === 'success' ? '#059669' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {couponFeedback.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  <span>{couponFeedback.text}</span>
                </div>
              )}
            </div>

            {/* Recuadro de Comercio Verificado por Mercado Pago */}
            <div className="enes-checkout-verified-merchant">
              <div className="enes-checkout-verified-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="enes-checkout-verified-content">
                <span className="enes-checkout-verified-title">Comercio verificado por Mercado Pago</span>
                <p className="enes-checkout-verified-company">
                  Recaudado por <strong>Auténticos (DO IT COLOMBIA S.A.S.)</strong>
                </p>
                <span className="enes-checkout-verified-meta">
                  NIT: 901.160.468-7 • Transacción 100% protegida
                </span>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="enes-checkout-footer">
        <p>© 2026 Auténticos • Todos los derechos reservados. Pagos procesados a través de Mercado Pago Colombia.</p>
      </footer>
    </div>
  );
}
