import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentPage.css'; // Reuse styles for consistency

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
                    setStatus('APPROVED');
                    setMessage('¡Pago exitoso! Redirigiendo...');
                    setTimeout(() => {
                        navigate('/advanced-intro');
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
                        setStatus('APPROVED');
                        setMessage('¡Pago de prueba exitoso! Redirigiendo...');
                        setTimeout(() => navigate('/advanced-intro'), 2000);
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
                        <button onClick={() => navigate('/payment')} className="btn-pay-now" style={{ marginBottom: '10px' }}>
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
