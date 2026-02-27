import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { uploadResultImage } from '../utils/imageUpload';

// Use environment variables or place your actual EmailJS config here
// It is recommended the user configures these in their env or provides them.
// We'll leave them as placeholders that need to be updated.
const EMAILJS_SERVICE_ID = 'service_29pk8s1';
const EMAILJS_TEMPLATE_ID = 'template_pqbh9ym';
const EMAILJS_PUBLIC_KEY = 'jvBHZwalOIEABW7qV';

const EmailResultModal = ({ isOpen, onClose, userEmail, imageBlob, top3 }) => {
    const [email, setEmail] = useState(userEmail || '');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleSendEmail = async (e) => {
        e.preventDefault();

        if (!email || !imageBlob || !top3) {
            setStatus('error');
            setErrorMessage('Faltan datos para enviar el correo.');
            return;
        }

        setStatus('loading');

        try {
            // 1. Upload Image to Supabase
            const fileName = `resultado-${Date.now()}.png`;
            const imageUrl = await uploadResultImage(imageBlob, fileName);

            if (!imageUrl) {
                throw new Error('No se pudo subir la imagen del resultado.');
            }

            // 2. Setup EmailJS Parameters
            const continueUrl = `${window.location.origin}/advanced-landing?t=${top3.map(t => t.type).join(',')}`;

            const templateParams = {
                user_email: email,
                image_url: imageUrl,
                type_1: top3[0]?.title || '',
                type_2: top3[1]?.title || '',
                type_3: top3[2]?.title || '',
                continue_link: continueUrl
            };

            // 3. Send Email
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            setStatus('success');

            // Auto close after success
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 3000);

        } catch (error) {
            console.error('Error detallado:', error);
            setStatus('error');
            // Mostramos el mensaje específico del error para diagnosticar
            setErrorMessage(error.message || 'Error desconocido al enviar el correo.');
        }
    };

    return (
        <div className="ennea-modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
            <div className="ennea-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="ennea-modal-header" style={{ marginBottom: '15px' }}>
                    <h2 className="ennea-modal-title" style={{ fontSize: '1.4rem' }}>
                        Tus Resultados por Correo
                    </h2>
                    <p className="ennea-modal-role" style={{ fontSize: '0.9rem', color: '#666' }}>
                        Recibe tu gráfico y eneatipos principales
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={48} color="#2ECC71" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ color: '#002d44', marginBottom: '10px' }}>¡Resultados enviados!</h3>
                        <p style={{ color: '#666' }}>Revisa tu bandeja de entrada (y la carpeta de spam por si acaso).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#002d44', fontWeight: 'bold' }}>
                                ¿A qué correo enviamos los resultados?
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{ color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                <AlertCircle size={16} />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div className="ennea-modal-footer" style={{ marginTop: '10px', borderTop: 'none', paddingTop: 0 }}>
                            <button
                                type="submit"
                                className="modal-btn-share"
                                disabled={status === 'loading'}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {status === 'loading' ? (
                                    <><Loader size={18} className="spin" /> Enviando...</>
                                ) : (
                                    <>Enviar mis resultados <Send size={18} /></>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {/* Adding a simple inline style for the loader spin to avoid needing extra css just for this */}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default EmailResultModal;
