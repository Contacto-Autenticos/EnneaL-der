import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './PaymentStyles.css';

const AutodiagPaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('id');
    const navigate = useNavigate();
    const [status, setStatus] = useState('PENDING'); 
    const [message, setMessage] = useState('Verificando tu pago...');

    useEffect(() => {
        if (!transactionId) {
            setStatus('ERROR');
            setMessage('No se encontró el ID de la transacción.');
            return;
        }

        const verifyTransaction = async () => {
            try {
                const response = await fetch(`https://production.wompi.co/v1/transactions/${transactionId}`);
                const data = await response.json();

                if (data.error) throw new Error(data.error.type || 'Error verificando transacción');

                const transactionStatus = data.data.status;

                if (transactionStatus === 'APPROVED') {
                    setStatus('APPROVED');
                    setMessage('¡Pago exitoso! Redirigiendo...');

                    // Guardar en la base de datos si existe data temporal
                    const tempUserStr = localStorage.getItem('tempAutodiagUser');
                    if (tempUserStr) {
                        try {
                            const tempUser = JSON.parse(tempUserStr);
                            await supabase.from('user_leads').insert([{
                                full_name: tempUser.name,
                                email: tempUser.email,
                                birth_date: tempUser.birth_date,
                                source: 'fascinantes_autodiag'
                            }]);
                        } catch (err) {
                            console.error('Error guardando en Supabase:', err);
                        }
                    }

                    // Establecemos la flag local de acceso pago
                    localStorage.setItem('autodiagPaid', 'true');
                    
                    // Limpiamos la temporal de registro si queremos, o la dejamos por si la usamos en AutodiagIntro
                    
                    setTimeout(() => {
                        navigate('/autodiag-intro');
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
                    setMessage('Tu pago está en proceso de validación.');
                }

            } catch (error) {
                console.error('Error verifying transaction:', error);

                // Fallback a sandbox
                try {
                    const sandboxResponse = await fetch(`https://sandbox.wompi.co/v1/transactions/${transactionId}`);
                    const sandboxData = await sandboxResponse.json();
                    if (!sandboxData.error && sandboxData.data.status === 'APPROVED') {
                        setStatus('APPROVED');
                        setMessage('¡Pago de prueba exitoso! Redirigiendo...');
                        
                        const tempUserStr = localStorage.getItem('tempAutodiagUser');
                        if (tempUserStr) {
                            try {
                                const tempUser = JSON.parse(tempUserStr);
                                await supabase.from('user_leads').insert([{
                                    full_name: tempUser.name,
                                    email: tempUser.email,
                                    birth_date: tempUser.birth_date,
                                    source: 'fascinantes_autodiag_sandbox'
                                }]);
                            } catch (err) {
                                console.error('Error guardando en Supabase sandbox:', err);
                            }
                        }

                        localStorage.setItem('autodiagPaid', 'true');

                        setTimeout(() => navigate('/autodiag-intro'), 2000);
                        return;
                    }
                } catch (e) {
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

                {status === 'PENDING' && <div className="status-icon pending">⏳</div>}
                {status === 'APPROVED' && <div className="status-icon success">✅</div>}
                {(status === 'DECLINED' || status === 'ERROR') && <div className="status-icon error">❌</div>}

                <p className="payment-description" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                    {message}
                </p>

                {(status === 'DECLINED' || status === 'ERROR') && (
                    <div style={{ marginTop: '30px' }}>
                        <button onClick={() => navigate('/autodiag-payment')} className="btn-retry">
                            Intentar de nuevo
                        </button>
                        <br />
                        <button onClick={() => navigate('/hub')} className="btn-cancel">
                            Volver al Centro de Análisis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutodiagPaymentStatus;
