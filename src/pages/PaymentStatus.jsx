import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
                        navigate('/payment-success', { state: { automatedCode } });
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

                        setTimeout(() => navigate('/payment-success', { state: { automatedCode } }), 2000);
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
                    <div style={{ marginTop: '30px' }}>
                        <button onClick={() => navigate('/payment')} className="btn-retry">
                            Intentar de nuevo
                        </button>
                        <br />
                        <button onClick={() => navigate('/result')} className="btn-cancel">
                            Volver a mis resultados
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
