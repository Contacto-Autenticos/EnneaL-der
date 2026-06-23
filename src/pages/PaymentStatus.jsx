import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { sendTelegramNotification } from '../utils/notifications';
import './PaymentStyles.css'; // Reuse styles for consistency

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('PENDING'); // PENDING, APPROVED, DECLINED, ERROR
    const [message, setMessage] = useState('Verificando tu pago...');

    useEffect(() => {
        if (!transactionId) {
            setStatus('ERROR');
            setMessage('No se encontró el ID de la transacción.');
            return;
        }

        const verifyTransaction = async () => {
            try {
                // Determine environment based on ID prefix or try both? 
                // Wompi IDs don't strictly indicate env, but we are prioritizing Production as per user request.
                // If the user switches back to Sandbox, this URL needs to match.
                // For now, we use the Production endpoint. 
                // NOTE: Sandbox IDs usually work on the Sandbox endpoint.

                const response = await fetch(`https://production.wompi.co/v1/transactions/${transactionId}`);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error.type || 'Error verificando transacción');
                }

                const transactionStatus = data.data.status;

                if (transactionStatus === 'APPROVED') {
                    // Check if they bought the kit
                    const boughtKit = localStorage.getItem('pendingBumpPurchase') === 'true';
                    if (boughtKit) {
                        localStorage.setItem('hasPaidForKit', 'true');
                    } else {
                        localStorage.removeItem('hasPaidForKit');
                    }
                    localStorage.removeItem('pendingBumpPurchase');

                    setStatus('APPROVED');
                    setMessage('¡Pago exitoso! Redirigiendo...');

                    // --- META PIXEL TRACKING ---
                    const reference = data.data.reference || '';
                    const isWorkshop = reference.startsWith('prog-');
                    const contentName = isWorkshop ? 'Taller / Programa' : 'Test Avanzado de Eneagrama';
                    const amountInCop = data.data.amount_in_cents / 100;
                    
                    if (window.fbq) {
                        window.fbq('track', 'Purchase', {
                            currency: 'COP',
                            value: amountInCop,
                            content_name: contentName
                        });
                    }
                    
                    // --- TELEGRAM NOTIFICATION ---
                    if (isWorkshop) {
                        sendTelegramNotification('workshop_inscription', {
                            email: data.data.customer_email,
                            amount: amountInCop,
                            reference: reference
                        });
                    } else {
                        sendTelegramNotification('advanced_test_purchase', {
                            email: data.data.customer_email,
                            amount: amountInCop,
                            reference: reference
                        });
                    }
                    // ----------------------------

                    // --- NEW: Send Confirmation and Scheduled Reminders ---
                    const sendWorkshopEmail = async () => {
                        const reference = data.data.reference || '';
                        if (reference.startsWith('prog-')) {
                            try {
                                // 1. Get name from user_leads
                                const { data: leadData } = await supabase
                                    .from('user_leads')
                                    .select('full_name')
                                    .eq('email', data.data.customer_email)
                                    .order('created_at', { ascending: false })
                                    .limit(1)
                                    .single();
                                
                                const fullName = leadData?.full_name || 'Participante';
                                const isVirtual = reference.includes('virtual');

                                const baseWorkshopInfo = {
                                    email: data.data.customer_email,
                                    name: fullName,
                                    workshop_type: isVirtual ? 'VIRTUAL' : 'PRESENCIAL',
                                    workshop_date: isVirtual ? '14, 15, 16 y 17 de Abr' : '11 de Abril',
                                    workshop_time: isVirtual ? '7:00 PM - 9:00 PM (Col)' : '9:00 AM - 5:00 PM'
                                };

                                // Define Event Start Date (COT -5:00)
                                const eventStartDate = isVirtual 
                                    ? new Date("2026-04-14T19:00:00-05:00") 
                                    : new Date("2026-04-11T09:00:00-05:00");

                                // List of emails to send
                                const emailQueue = [
                                    { templateId: 1 } // Immediate Confirmation
                                ];

                                // 1. Reminder 3 days before (All)
                                const rem3Days = new Date(eventStartDate.getTime() - (3 * 24 * 60 * 60 * 1000));
                                if (rem3Days > new Date()) {
                                    emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });
                                }

                                // 2. Reminder 24 hours before
                                const rem24h = new Date(eventStartDate.getTime() - (24 * 60 * 60 * 1000));
                                if (rem24h > new Date()) {
                                    emailQueue.push({ 
                                        templateId: isVirtual ? 6 : 3, 
                                        scheduledAt: rem24h.toISOString() 
                                    });
                                }

                                // 3. Virtual specific reminders (2h and 10m before)
                                if (isVirtual) {
                                    const rem2h = new Date(eventStartDate.getTime() - (2 * 60 * 60 * 1000));
                                    if (rem2h > new Date()) {
                                        emailQueue.push({ templateId: 4, scheduledAt: rem2h.toISOString() });
                                    }

                                    const rem10m = new Date(eventStartDate.getTime() - (10 * 60 * 1000));
                                    if (rem10m > new Date()) {
                                        emailQueue.push({ templateId: 5, scheduledAt: rem10m.toISOString() });
                                    }
                                }

                                // Send everything
                                await Promise.all(emailQueue.map(item => 
                                    supabase.functions.invoke('send-workshop-email', {
                                        body: { ...baseWorkshopInfo, ...item }
                                    })
                                ));
                                
                                console.log(`Successful payment: ${emailQueue.length} workshop emails enqueued/sent.`);
                            } catch (err) {
                                console.error('Error triggering workshop emails:', err);
                            }
                        }
                    };
                    sendWorkshopEmail();
                    // ------------------------------------------------

                    // Retrieve the automated access code from Supabase
                    let automatedCode = null;
                    try {
                        const { data: codeData } = await supabase
                            .from('access_codes')
                            .select('code')
                            .eq('transaction_id', transactionId)
                            .single();

                        if (codeData) automatedCode = codeData.code;
                    } catch (err) {
                        console.error('Error fetching generated code:', err);
                    }

                    setTimeout(() => {
                        navigate('/eneagrama-payment-success', { state: { automatedCode } });
                    }, 2000);
                } else if (transactionStatus === 'DECLINED') {
                    setStatus('DECLINED');
                    setMessage('Tu pago fue rechazado. Por favor intenta con otro medio de pago.');
                } else if (transactionStatus === 'VOIDED') {
                    setStatus('DECLINED');
                    setMessage('La transacción fue anulada.');
                } else if (transactionStatus === 'ERROR') {
                    setStatus('ERROR');
                    setMessage('Ocurrió un error al procesar el pago.');
                } else {
                    setStatus('PENDING');
                    setMessage('Tu pago está en proceso de validación. Te notificaremos por correo.');
                    // Optionally hold or redirect to a pending page
                }

            } catch (error) {
                console.error('Error verifying transaction:', error);

                // Fallback check for Sandbox in case they are testing
                try {
                    const sandboxResponse = await fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`);
                    const sandboxData = await sandboxResponse.json();
                    if (!sandboxData.error && sandboxData.data.status === 'APPROVED') {
                        // Check if they bought the kit in sandbox
                        const boughtKit = localStorage.getItem('pendingBumpPurchase') === 'true';
                        if (boughtKit) {
                            localStorage.setItem('hasPaidForKit', 'true');
                        } else {
                            localStorage.removeItem('hasPaidForKit');
                        }
                        localStorage.removeItem('pendingBumpPurchase');

                        setStatus('APPROVED');
                        setMessage('¡Pago de prueba exitoso! Redirigiendo...');

                        // Retrieve the automated access code (even in sandbox)
                        let automatedCode = null;
                        try {
                            const { data: codeData } = await supabase
                                .from('access_codes')
                                .select('code')
                                .eq('transaction_id', transactionId)
                                .single();

                            if (codeData) automatedCode = codeData.code;
                        } catch (err) {
                            console.error('Error fetching generated code:', err);
                        }

                        setTimeout(() => navigate('/eneagrama-payment-success', { state: { automatedCode } }), 2000);
                        return;
                    }
                } catch (e) {
                    // Ignore sandbox error
                }

                setStatus('ERROR');
                setMessage('Hubo un problema verificando el estado del pago.');
            }
        };

        verifyTransaction();
    }, [transactionId, navigate]);

    return (
        <div className="payment-page">
            <div className="payment-container" style={{ textAlign: 'center' }}>
                <h2 className="payment-title">Estado del Pago</h2>

                {status === 'PENDING' && (
                    <div className="status-icon pending">⏳</div>
                )}

                {status === 'APPROVED' && (
                    <div className="status-icon success">✅</div>
                )}

                {(status === 'DECLINED' || status === 'ERROR') && (
                    <div className="status-icon error">❌</div>
                )}

                <p className="payment-description" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                    {message}
                </p>

                {(status === 'DECLINED' || status === 'ERROR') && (
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                        <button onClick={() => navigate('/eneagrama-payment')} className="btn-retry">
                            Intentar de nuevo
                        </button>
                        <button onClick={() => navigate('/eneagrama-result')} className="btn-cancel">
                            Volver a mis resultados
                        </button>
                        <a 
                            href="https://wa.me/573164287586?text=Hola,%20tuve%20un%20inconveniente%20con%20mi%20pago%20en%20la%20plataforma%20y%20necesito%20ayuda." 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ padding: '12px 24px', background: '#25D366', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '300px', justifyContent: 'center' }}
                        >
                            Contactar Soporte
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
