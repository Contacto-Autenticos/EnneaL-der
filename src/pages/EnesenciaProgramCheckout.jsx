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
  onBlur,
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
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        autoComplete={autoComplete}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        onKeyDown={onKeyDown}
        className="enes-checkout-field-input"
      />
    </div>
  );
};

export default function EnesenciaProgramCheckout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // flow: 'genuinos' | 'hqs'
  const flowParam = searchParams.get('product') || searchParams.get('flow') || 'genuinos';
  const isHqs = flowParam === 'hqs' || flowParam === 'haz-que-suceda';
  const activeFlow = isHqs ? 'hqs' : 'genuinos';

  // plan para genuinos: 'virtual' | 'presencial'
  const initialPlan = searchParams.get('plan') === 'presencial' ? 'presencial' : 'virtual';
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  const [formData, setFormData] = useState({
    full_name: searchParams.get('name') || localStorage.getItem('genuinos_name') || localStorage.getItem('workshop_name') || '',
    email: searchParams.get('email') || localStorage.getItem('genuinos_email') || localStorage.getItem('workshop_email') || '',
    phone: searchParams.get('phone') || '',
    city: searchParams.get('city') || '',
    hasFoodRestriction: 'no',
    foodRestrictionDetails: '',
    hasMobilityRequirement: 'no',
    mobilityRequirementDetails: ''
  });

  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const cityInputRef = useRef(null);

  // Descuento automático por compras previas del Test Avanzado / Plan de Acción (exclusivo Genuinos)
  const [prevPurchaseDiscount, setPrevPurchaseDiscount] = useState(0);
  const [checkingPrevDiscount, setCheckingPrevDiscount] = useState(false);

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

  const checkPreviousPurchasesOnServer = useCallback(async (rawEmail) => {
    if (isHqs) return;
    const cleanEmail = String(rawEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setPrevPurchaseDiscount(0);
      return;
    }

    setCheckingPrevDiscount(true);
    try {
      const { data } = await supabase.functions.invoke('enesencia-process-payment', {
        body: {
          action: 'check_previous_purchases',
          email: cleanEmail
        }
      });
      if (data?.ok && typeof data.discountCOP === 'number') {
        setPrevPurchaseDiscount(data.discountCOP);
      }
    } catch {} finally {
      setCheckingPrevDiscount(false);
    }
  }, [isHqs]);

  useEffect(() => {
    if (!isHqs && formData.email && formData.email.includes('@')) {
      checkPreviousPurchasesOnServer(formData.email);
    }
  }, [isHqs, formData.email, checkPreviousPurchasesOnServer]);

  const basePriceCOP = isHqs
    ? 450000
    : (selectedPlan === 'virtual' ? 365000 : 870000);

  const afterPrevDiscountCOP = isHqs
    ? basePriceCOP
    : Math.max(0, basePriceCOP - prevPurchaseDiscount);

  const discountPct = appliedCoupon ? Number(appliedCoupon.discountPercentage || 0) : 0;
  const finalAmountCOP = Math.floor(afterPrevDiscountCOP * (1 - discountPct / 100));
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
          flow: activeFlow,
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
  }, [activeFlow]);

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

  const handlePlanSwitch = (e) => {
    const newPlan = e.target.value;
    setSelectedPlan(newPlan);
    const next = new URLSearchParams(searchParams);
    next.set('product', 'genuinos');
    next.set('plan', newPlan);
    setSearchParams(next, { replace: true });
  };

  const triggerSuccessConfetti = () => {
    try {
      import('canvas-confetti').then((module) => {
        const confetti = module.default || module;
        confetti({ particleCount: 115, spread: 75, origin: { y: 0.6 } });
      });
    } catch {}
  };

  const handleFreeRedeem = async () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.full_name.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanName || !cleanEmail || !cleanEmail.includes('@') || !cleanPhone) {
      setErrorMessage('Por favor completa Nombre, Correo Electrónico y Teléfono en el Paso 1.');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmittingBrick(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('enesencia-process-payment', {
        body: {
          action: 'redeem_free',
          flow: activeFlow,
          couponCode: appliedCoupon?.code || couponInput,
          customerEmail: cleanEmail,
          customerName: cleanName,
          customerPhone: cleanPhone,
          customerCity: formData.city.trim(),
          foodRestriction: formData.hasFoodRestriction === 'si' ? formData.foodRestrictionDetails : 'No',
          mobilityRequirement: formData.hasMobilityRequirement === 'si' ? formData.mobilityRequirementDetails : 'No'
        }
      });

      if (error || !data?.ok) {
        throw new Error(data?.error || error?.message || 'No fue posible aplicar el cupón.');
      }

      setIsSubmittingBrick(false);
      triggerSuccessConfetti();

      if (isHqs) {
        navigate(`/inscripcion-status?status=approved&collection_id=free_${data.registrationId}`);
      } else {
        navigate('/eneagrama-payment-success', { state: { automatedCode: data.automatedCode } });
      }
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
        const cleanName = formData.full_name.trim();
        const cleanPhone = formData.phone.trim();

        if (!cleanName || !cleanEmail || !cleanEmail.includes('@') || !cleanPhone) {
          const msg = 'Por favor completa tu Nombre, Correo Electrónico y Teléfono en el Paso 1 antes de pagar.';
          setErrorMessage(msg);
          setIsSubmittingBrick(false);
          window.scrollTo({ top: 100, behavior: 'smooth' });
          reject(new Error(msg));
          return;
        }

        const { data, error } = await supabase.functions.invoke('enesencia-process-payment', {
          body: {
            action: 'pay',
            flow: activeFlow,
            plan: selectedPlan,
            couponCode: appliedCoupon?.code || '',
            customerEmail: cleanEmail,
            customerName: cleanName,
            customerPhone: cleanPhone,
            customerCity: formData.city.trim(),
            foodRestriction: formData.hasFoodRestriction === 'si' ? formData.foodRestrictionDetails : 'No',
            mobilityRequirement: formData.hasMobilityRequirement === 'si' ? formData.mobilityRequirementDetails : 'No',
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

          if (window.fbq && paidAmount > 0) {
            window.fbq('track', 'Purchase', {
              currency: 'COP',
              value: paidAmount,
              content_name: isHqs ? 'Taller Haz Que Suceda' : `Programa Genuinos (${selectedPlan})`
            });
          }

          setPaymentResult({
            status: 'approved',
            id: data.id,
            title: '¡Inscripción Confirmada con Éxito!',
            message: isHqs
              ? 'Tu cupo en el Taller Experiencial Haz Que Suceda ha sido confirmado. Revisa tu correo electrónico para ver todos los detalles.'
              : `Tu inscripción al Programa Genuinos (Modalidad ${selectedPlan === 'virtual' ? 'Virtual' : 'Presencial'}) ha sido confirmada.`,
            amountPaid: paidAmount,
            automatedCode: data.automatedCode
          });

          if (!isHqs) {
            setTimeout(() => {
              navigate('/eneagrama-payment-success', { state: { automatedCode: data.automatedCode } });
            }, 2200);
          }
          resolve();
        } else if (data.status === 'pending' || data.status === 'in_process') {
          const redirectUrl = data.transaction_details?.external_resource_url;
          setPaymentResult({
            status: 'pending',
            id: data.id,
            title: 'Pago Pendiente de Confirmación',
            message: redirectUrl
              ? 'Por favor completa el pago a través de tu entidad bancaria (PSE / Efecty / Banco).'
              : 'Estamos procesando tu pago. Te notificaremos por correo en cuanto el banco lo confirme.',
            redirectUrl,
            amountPaid: Number(data.transaction_amount || finalAmountCOP)
          });
          resolve();
        } else {
          const detailMsg = data.status_detail ? ` (${data.status_detail})` : '';
          throw new Error(`El pago fue rechazado por el banco o pasarela${detailMsg}. Por favor intenta con otra tarjeta o medio.`);
        }
      } catch (err) {
        console.error('Error al procesar pago programa:', err);
        setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar el pago.');
        setIsSubmittingBrick(false);
        reject(err);
      }
    });
  }, [formData, activeFlow, selectedPlan, appliedCoupon, finalAmountCOP, isHqs, navigate]);

  const handleBrickError = useCallback((error) => {
    console.error('Error en el SDK de Mercado Pago:', error);
  }, []);

  const productTitle = isHqs
    ? 'Taller Haz Que Suceda'
    : `Programa Genuinos (${selectedPlan === 'virtual' ? 'Virtual' : 'Presencial'})`;

  const featuresList = isHqs
    ? [
        'Experiencia presencial de 8:30 AM a 12:30 PM (Uniandinos Bogotá)',
        'Música en vivo y dinámicas experienciales de transformación',
        'Refrigerio y materiales de trabajo incluidos',
        'Garantía de satisfacción 100% protegida'
      ]
    : selectedPlan === 'virtual'
    ? [
        '4 sesiones en vivo online con mentores de Auténticos',
        'Test Avanzado de Eneagrama + Plan de Acción incluidos',
        'Cuaderno de trabajo digital y grabaciones de respaldo',
        'Descuento automático si ya adquiriste antes el Test Avanzado'
      ]
    : [
        'Inmersión presencial completa + refrigerios y materiales físicos',
        'Test Avanzado de Eneagrama + Plan de Acción incluidos',
        'Acompañamiento personalizado y networking presencial',
        'Descuento automático si ya adquiriste antes el Test Avanzado'
      ];

  return (
    <div className="enes-checkout-wrapper">
      <header className="enes-checkout-header">
        <div className="enes-checkout-header-inner">
          <button
            type="button"
            onClick={() => navigate(isHqs ? '/inscripcion-haz-que-suceda' : '/programa-genuinos')}
            className="enes-checkout-back-link"
            title="Volver al Programa"
            aria-label="Volver al Programa"
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

          {/* Columna Izquierda: Paso 1 (Inscripción) y Paso 2 (Pago) */}
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

                <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: '410px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
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
                    <span style={{ color: '#64748B' }}>Programa:</span>
                    <strong style={{ color: '#002D44' }}>{productTitle}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B' }}>Participante:</span>
                    <strong style={{ color: '#002D44' }}>{formData.full_name}</strong>
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

                {/* PASO 1: INSCRIPCIÓN */}
                <div className="enes-checkout-step1-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="enes-checkout-step-num">1</span>
                    <h3 className="enes-checkout-form-title" style={{ margin: 0 }}>Inscripción</h3>
                  </div>
                  <p className="enes-checkout-form-subtitle">
                    Ingresa tus datos de contacto para reservar tu cupo.
                  </p>

                  <div className="enes-checkout-fields-stack">
                    <CheckoutFloatingField
                      id="prog-chk-name"
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
                      id="prog-chk-email"
                      name="email"
                      label="Correo Electrónico *"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={(e) => checkPreviousPurchasesOnServer(e.target.value)}
                      autoComplete="email"
                      inputMode="email"
                      enterKeyHint="next"
                      inputRef={emailInputRef}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          phoneInputRef.current?.focus();
                        }
                      }}
                    />

                    <CheckoutFloatingField
                      id="prog-chk-phone"
                      name="phone"
                      label="Teléfono (WhatsApp) *"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint={isHqs ? 'next' : 'done'}
                      inputRef={phoneInputRef}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isHqs) {
                          e.preventDefault();
                          cityInputRef.current?.focus();
                        }
                      }}
                    />

                    {isHqs && (
                      <>
                        <CheckoutFloatingField
                          id="prog-chk-city"
                          name="city"
                          label="Ciudad *"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          enterKeyHint="done"
                          inputRef={cityInputRef}
                        />

                        <div style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002D44', marginBottom: '6px' }}>
                              ¿Tienes alguna restricción alimentaria o alergia?
                            </span>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.86rem', fontWeight: 600 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="hasFoodRestriction" value="no" checked={formData.hasFoodRestriction === 'no'} onChange={handleChange} />
                                No
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="hasFoodRestriction" value="si" checked={formData.hasFoodRestriction === 'si'} onChange={handleChange} />
                                Sí
                              </label>
                            </div>
                            {formData.hasFoodRestriction === 'si' && (
                              <input
                                type="text"
                                name="foodRestrictionDetails"
                                value={formData.foodRestrictionDetails}
                                onChange={handleChange}
                                placeholder="¿Cuál restricción alimentaria?"
                                style={{
                                  marginTop: '8px',
                                  width: '100%',
                                  height: '40px',
                                  padding: '0 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.86rem',
                                  boxSizing: 'border-box'
                                }}
                              />
                            )}
                          </div>

                          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002D44', marginBottom: '6px' }}>
                              ¿Tienes algún requerimiento especial de movilidad?
                            </span>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.86rem', fontWeight: 600 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="hasMobilityRequirement" value="no" checked={formData.hasMobilityRequirement === 'no'} onChange={handleChange} />
                                No
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="hasMobilityRequirement" value="si" checked={formData.hasMobilityRequirement === 'si'} onChange={handleChange} />
                                Sí
                              </label>
                            </div>
                            {formData.hasMobilityRequirement === 'si' && (
                              <input
                                type="text"
                                name="mobilityRequirementDetails"
                                value={formData.mobilityRequirementDetails}
                                onChange={handleChange}
                                placeholder="¿Cuál requerimiento de movilidad?"
                                style={{
                                  marginTop: '8px',
                                  width: '100%',
                                  height: '40px',
                                  padding: '0 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  fontSize: '0.86rem',
                                  boxSizing: 'border-box'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
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
                          <span>Confirmando inscripción...</span>
                        </>
                      ) : (
                        <>
                          <span>Completar Inscripción con Cupón 100%</span>
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
                src={isHqs ? '/Isotipo-Brujula-MLT.webp' : '/Iconos de programas/Programa_genuinos_huella_icono.png'}
                alt={productTitle}
                className="enes-checkout-product-thumb"
                onError={(e) => { e.currentTarget.src = '/Isotipo-Brujula-MLT.webp'; }}
              />
              <div className="enes-checkout-product-info">
                <span className="enes-checkout-product-tag">Programa seleccionado</span>
                <h2 className="enes-checkout-product-name">{productTitle}</h2>
              </div>
            </div>

            {!isHqs && (
              <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
                <label htmlFor="gen-plan-select" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Modalidad del Programa Genuinos:
                </label>
                <select
                  id="gen-plan-select"
                  value={selectedPlan}
                  onChange={handlePlanSwitch}
                  disabled={isSubmittingBrick}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#002D44',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="virtual">Modalidad Virtual (Online en Vivo) — $365.000 COP</option>
                  <option value="presencial">Modalidad Presencial (Inmersión) — $870.000 COP</option>
                </select>
              </div>
            )}

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
                <span>Inversión del programa</span>
                <span>${formatCOP(basePriceCOP)} COP</span>
              </div>

              {!isHqs && checkingPrevDiscount && (
                <div className="enes-checkout-price-row" style={{ color: '#0284C7', fontSize: '0.82rem' }}>
                  <span>Verificando compras previas del test...</span>
                  <Loader2 size={14} className="animate-spin" />
                </div>
              )}

              {!isHqs && prevPurchaseDiscount > 0 && (
                <div className="enes-checkout-price-row" style={{ color: '#059669' }}>
                  <span>Abono por compra previa del Test Avanzado</span>
                  <span>-${formatCOP(prevPurchaseDiscount)} COP</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="enes-checkout-price-row" style={{ color: '#059669' }}>
                  <span>Descuento {appliedCoupon.code} (-{appliedCoupon.discountPercentage}%)</span>
                  <span>-${formatCOP(afterPrevDiscountCOP - finalAmountCOP)} COP</span>
                </div>
              )}

              <div className="enes-checkout-price-row is-total">
                <span className="enes-checkout-total-title">Total a pagar hoy:</span>
                <div className="enes-checkout-total-value">
                  <div className="enes-checkout-total-cop-main">
                    ${formatCOP(finalAmountCOP)} <span>COP</span>
                  </div>
                  <div className="enes-checkout-total-sub">
                    Pago único • Cupo garantizado
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
