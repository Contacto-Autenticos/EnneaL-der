import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './PaymentStyles.css';

const MpStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // MercadoPago devuelve estos parámetros en la URL de retorno
    const status = searchParams.get('status');       // 'approved', 'failure', 'pending'
    const paymentId = searchParams.get('payment_id'); // ID de la transacción MP
    const plan = searchParams.get('plan');            // 'virtual' o 'presencial'

    const [uiStatus, setUiStatus] = useState('PENDING');
    const [message, setMessage] = useState('Verificando tu pago...');

    useEffect(() => {
        const processStatus = async () => {
            if (status === 'approved') {
                setUiStatus('APPROVED');
                setMessage('¡Pago exitoso! Procesando tu acceso...');

                try {
                    // Trigger webhook manually as a fallback (Doble Verificación)
                    // Fire-and-forget request bypassing CORS via mode: 'no-cors'
                    if (paymentId) {
                        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook?id=${paymentId}&topic=payment`;
                        fetch(webhookUrl, { mode: 'no-cors' }).catch(err => console.error("Fallback webhook failed:", err));
                    }

                    const reference = `gen-${plan}-${paymentId}`;
                    const isVirtual = plan === 'virtual';

                    // Intentar obtener el último lead registrado (guardado en localStorage durante el registro)
                    const storedEmail = localStorage.getItem('genuinos_email') || '';
                    const storedName = localStorage.getItem('genuinos_name') || 'Participante';

                    if (storedEmail) {
                        const baseWorkshopInfo = {
                            email: storedEmail,
                            name: storedName,
                            workshop_type: isVirtual ? 'VIRTUAL' : 'PRESENCIAL',
                            workshop_date: isVirtual ? '14, 15, 16 y 17 de Abr' : '11 de Abril',
                            workshop_time: isVirtual ? '7:00 PM - 9:00 PM (Col)' : '9:00 AM - 5:00 PM',
                        };

                        const eventStartDate = isVirtual
                            ? new Date('2026-04-14T19:00:00-05:00')
                            : new Date('2026-04-11T09:00:00-05:00');

                        const emailQueue = [{ templateId: 1 }]; // Confirmación inmediata

                        const rem3Days = new Date(eventStartDate.getTime() - 3 * 24 * 60 * 60 * 1000);
                        if (rem3Days > new Date()) emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });

                        const rem24h = new Date(eventStartDate.getTime() - 24 * 60 * 60 * 1000);
                        if (rem24h > new Date()) emailQueue.push({ templateId: isVirtual ? 6 : 3, scheduledAt: rem24h.toISOString() });

                        if (isVirtual) {
                            const rem2h = new Date(eventStartDate.getTime() - 2 * 60 * 60 * 1000);
                            if (rem2h > new Date()) emailQueue.push({ templateId: 4, scheduledAt: rem2h.toISOString() });

                            const rem10m = new Date(eventStartDate.getTime() - 10 * 60 * 1000);
                            if (rem10m > new Date()) emailQueue.push({ templateId: 5, scheduledAt: rem10m.toISOString() });
                        }

                        await Promise.all(
                            emailQueue.map((item) =>
                                supabase.functions.invoke('send-workshop-email', {
                                    body: { ...baseWorkshopInfo, ...item },
                                })
                            )
                        );

                        // Limpiar datos temporales
                        localStorage.removeItem('genuinos_email');
                        localStorage.removeItem('genuinos_name');
                    }
                } catch (err) {
                    console.error('Error enviando correo de confirmación:', err);
                }

                setTimeout(() => {
                    navigate('/eneagrama-payment-success');
                }, 2000);

            } else if (status === 'failure') {
                setUiStatus('DECLINED');
                setMessage('Tu pago fue rechazado o cancelado. Por favor intenta de nuevo.');

            } else if (status === 'pending') {
                setUiStatus('PENDING');
                setMessage('Tu pago está en proceso de validación. Te notificaremos por correo cuando se confirme.');

            } else {
                setUiStatus('ERROR');
                setMessage('No se pudo determinar el estado del pago. Contáctanos si realizaste el pago.');
            }
        };

        processStatus();
    }, [status, paymentId, plan, navigate]);

    return (
        <div className="payment-page">
            <div className="payment-container" style={{ textAlign: 'center' }}>
                <h2 className="payment-title">Estado del Pago</h2>

                {uiStatus === 'PENDING' && <div className="status-icon pending">⏳</div>}
                {uiStatus === 'APPROVED' && <div className="status-icon success">✅</div>}
                {(uiStatus === 'DECLINED' || uiStatus === 'ERROR') && <div className="status-icon error">❌</div>}

                <p className="payment-description" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                    {message}
                </p>

                {(uiStatus === 'DECLINED' || uiStatus === 'ERROR') && (
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => navigate('/programa-genuinos')} className="btn-retry">
                            Volver al programa
                        </button>
                        <button
                            onClick={() =>
                                window.open(
                                    'https://wa.me/573XXXXXXXXX?text=Hola,%20tuve%20un%20problema%20con%20mi%20pago%20en%20el%20programa%20Genuinos',
                                    '_blank'
                                )
                            }
                            className="btn-cancel"
                        >
                            Contactar soporte por WhatsApp
                        </button>
                    </div>
                )}

                {uiStatus === 'PENDING' && message.includes('proceso') && (
                    <div style={{ marginTop: '30px' }}>
                        <button onClick={() => navigate('/programa-genuinos')} className="btn-cancel">
                            Volver al programa
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MpStatus;
