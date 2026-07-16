import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { sendWebPushNotification } from '../utils/notifications';
import './PaymentStyles.css';

const WorkshopPaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get('status');       // 'approved', 'failure', 'pending'
    const paymentId = searchParams.get('payment_id'); // ID de la transacción MP
    const preferenceId = searchParams.get('preference_id');

    const [uiStatus, setUiStatus] = useState('PENDING');
    const [message, setMessage] = useState('Verificando tu pago...');

    useEffect(() => {
        const processStatus = async () => {
            if (status === 'approved') {
                setUiStatus('APPROVED');
                setMessage('¡Pago exitoso! Estamos confirmando tu lugar en el taller...');

                try {
                    // Trigger webhook manually as a fallback (Doble Verificación)
                    // Fire-and-forget request bypassing CORS via mode: 'no-cors'
                    if (paymentId) {
                        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook?id=${paymentId}&topic=payment`;
                        fetch(webhookUrl, { mode: 'no-cors' }).catch(err => console.error("Fallback webhook failed:", err));
                    }

                    const storedEmail = localStorage.getItem('workshop_email');
                    const storedName = localStorage.getItem('workshop_name');
                    const registrationId = localStorage.getItem('workshop_reg_id');

                    if (registrationId) {
                        // Limpiar datos temporales
                        localStorage.removeItem('workshop_email');
                        localStorage.removeItem('workshop_name');
                        localStorage.removeItem('workshop_reg_id');
                        
                        // Actualizar mensaje final
                        setMessage('¡Inscripción confirmada! Revisa tu correo electrónico para ver todos los detalles y los próximos pasos.');
                    }
                } catch (err) {
                    console.error('Error procesando el estado del pago:', err);
                    setMessage('Tu pago fue aprobado, pero hubo un error al procesar el estado en tu navegador. Si el cobro se realizó, tu inscripción es válida.');
                }

            } else if (status === 'failure') {
                setUiStatus('DECLINED');
                setMessage('Tu pago fue rechazado. Por favor intenta de nuevo.');

            } else if (status === 'pending') {
                setUiStatus('PENDING');
                setMessage('Tu pago está en proceso de validación. Te avisaremos por correo.');

            } else {
                setUiStatus('ERROR');
                setMessage('No pudimos verificar el estado de tu pago.');
            }
        };

        processStatus();
    }, [status, paymentId, preferenceId, navigate]);

    return (
        <div className="payment-page">
            <div className="payment-container" style={{ textAlign: 'center' }}>
                <h2 className="payment-title">Estado de Inscripción</h2>

                {uiStatus === 'PENDING' && <div className="status-icon pending">⏳</div>}
                {uiStatus === 'APPROVED' && <div className="status-icon success">✅</div>}
                {(uiStatus === 'DECLINED' || uiStatus === 'ERROR') && <div className="status-icon error">❌</div>}

                <p className="payment-description" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                    {message}
                </p>

                {(uiStatus === 'DECLINED' || uiStatus === 'ERROR') && (
                    <div style={{ marginTop: '30px' }}>
                        <button onClick={() => navigate('/inscripcion-haz-que-suceda')} className="btn-retry">
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {uiStatus === 'APPROVED' && (
                    <div style={{ marginTop: '30px' }}>
                        <button onClick={() => navigate('/eneagrama')} className="btn-retry" style={{ backgroundColor: '#002d44' }}>
                            Volver al inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkshopPaymentStatus;
