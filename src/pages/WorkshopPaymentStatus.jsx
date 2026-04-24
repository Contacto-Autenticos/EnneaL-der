import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
                    const storedEmail = localStorage.getItem('workshop_email');
                    const storedName = localStorage.getItem('workshop_name');
                    const registrationId = localStorage.getItem('workshop_reg_id');

                    if (registrationId) {
                        // 1. Actualizar estado en Supabase
                        await supabase
                            .from('workshop_registrations')
                            .update({ 
                                payment_status: 'APPROVED', 
                                transaction_id: paymentId,
                                raw_data: { preference_id: preferenceId }
                            })
                            .eq('id', registrationId);

                        // 2. Disparar correos si tenemos los datos
                        if (storedEmail) {
                            const workshopDate = new Date('2026-05-01T09:00:00-05:00');
                            
                            const baseEmailInfo = {
                                email: storedEmail,
                                name: storedName,
                                workshop_type: 'FASCINANTES',
                                workshop_date: '1 de Mayo',
                                workshop_time: '9:00 AM - 1:00 PM',
                                workshop_location: 'https://maps.app.goo.gl/R64NW2y99LhatQA37',
                            };

                            // Cola de correos a enviar/programar
                            const emailQueue = [
                                { templateId: 1 } // Confirmación inmediata (Template ID 1)
                            ];

                            // Recordatorio 3 días antes (Abril 28)
                            const rem3Days = new Date(workshopDate.getTime() - 3 * 24 * 60 * 60 * 1000);
                            if (rem3Days > new Date()) {
                                emailQueue.push({ templateId: 2, scheduledAt: rem3Days.toISOString() });
                            }

                            // Recordatorio 24 horas antes (Abril 30)
                            const rem24h = new Date(workshopDate.getTime() - 24 * 60 * 60 * 1000);
                            if (rem24h > new Date()) {
                                emailQueue.push({ templateId: 3, scheduledAt: rem24h.toISOString() });
                            }

                            // Invocar función para cada correo
                            await Promise.all(
                                emailQueue.map((item) =>
                                    supabase.functions.invoke('send-workshop-email', {
                                        body: { ...baseEmailInfo, ...item },
                                    })
                                )
                            );

                            console.log('Correos de taller procesados');
                        }

                        // Limpiar datos temporales
                        localStorage.removeItem('workshop_email');
                        localStorage.removeItem('workshop_name');
                        localStorage.removeItem('workshop_reg_id');
                    }
                } catch (err) {
                    console.error('Error procesando el estado del pago:', err);
                }

                setTimeout(() => {
                    navigate('/payment-success');
                }, 3000);

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
                        <button onClick={() => navigate('/inscripcion')} className="btn-retry">
                            Intentar de nuevo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkshopPaymentStatus;
