import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    User, Mail, Phone, Calendar, 
    Sparkles, Send, AlertTriangle, Loader2 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import './LiderazgoLeadModal.css';

/**
 * Función auxiliar para verificar si el usuario ya cuenta con datos completos de registro
 */
export const checkIsTemperamentoRegistered = () => {
    try {
        const savedData = localStorage.getItem('temperamento_user_data') 
                       || localStorage.getItem('autenticos_user_data')
                       || localStorage.getItem('liderazgo_user_data') 
                       || localStorage.getItem('tempAutodiagUser');
        if (!savedData) return false;
        const parsed = JSON.parse(savedData);
        const name = parsed.full_name || parsed.name;
        return Boolean(name && parsed.email && parsed.phone && parsed.birth_date);
    } catch {
        return false;
    }
};

const TemperamentoLeadModal = ({ isOpen, onSuccess }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Opciones para el selector de fecha de nacimiento
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 90 }, (_, i) => String(currentYear - 14 - i));

    // Precargar datos previos si existen (URL params o localStorage)
    useEffect(() => {
        if (!isOpen) return;

        // 1. Revisar URL params (útil si viene redirigido desde Academia)
        try {
            const params = new URLSearchParams(window.location.search);
            const qEmail = params.get('email');
            const qName = params.get('name') || params.get('full_name');
            const qPhone = params.get('phone');
            const qBirthDate = params.get('birth_date') || params.get('birthDate');
            if (qEmail) setEmail(qEmail);
            if (qName) setFullName(qName);
            if (qPhone) setPhone(qPhone);
            if (qBirthDate) {
                const [y, m, d] = qBirthDate.split('-');
                if (y) setYear(y);
                if (m) setMonth(m.padStart(2, '0'));
                if (d) setDay(d.padStart(2, '0'));
            }
        } catch {}

        // 2. Revisar localStorage
        try {
            const savedStr = localStorage.getItem('temperamento_user_data') 
                          || localStorage.getItem('autenticos_user_data')
                          || localStorage.getItem('liderazgo_user_data') 
                          || localStorage.getItem('tempAutodiagUser');
            if (savedStr) {
                const parsed = JSON.parse(savedStr);
                if (parsed.full_name || parsed.name) setFullName(prev => prev || parsed.full_name || parsed.name);
                if (parsed.email) setEmail(prev => prev || parsed.email);
                if (parsed.phone) setPhone(prev => prev || parsed.phone);
                if (parsed.birth_date) {
                    const [y, m, d] = parsed.birth_date.split('-');
                    if (y) setYear(y);
                    if (m) setMonth(m.padStart(2, '0'));
                    if (d) setDay(d.padStart(2, '0'));
                }
            }
        } catch {
            // Ignorar errores de parseo
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setSubmitError(null);

        const cleanName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();

        if (!cleanName) {
            setSubmitError('Por favor ingresa tu nombre y apellido.');
            return;
        }

        if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            setSubmitError('Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!cleanPhone || cleanPhone.length < 7) {
            setSubmitError('Por favor ingresa un número de teléfono válido.');
            return;
        }

        if (!day || !month || !year) {
            setSubmitError('Por favor selecciona tu fecha de nacimiento completa (día, mes y año).');
            return;
        }

        setIsSubmitting(true);
        const birthDate = `${year}-${month}-${day}`;

        try {
            // 1. Guardar en Supabase (user_leads)
            const { error: dbError } = await supabase.from('user_leads').insert([{
                full_name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                birth_date: birthDate,
                source: 'temperamento_modal_registro'
            }]);

            if (dbError) {
                console.warn('Aviso al guardar en user_leads:', dbError.message);
            }

            // 2. Guardar en localStorage para persistencia y conexión inmediata con la Academia
            const userData = {
                full_name: cleanName,
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                birth_date: birthDate
            };

            localStorage.setItem('temperamento_lead_registered', 'true');
            localStorage.setItem('temperamento_user_data', JSON.stringify(userData));
            localStorage.setItem('tempAutodiagUser', JSON.stringify(userData));
            localStorage.setItem('autenticos_lead_registered', 'true');
            localStorage.setItem('autenticos_user_data', JSON.stringify(userData));
            localStorage.setItem('autenticos_user_email', cleanEmail);

            // Notificar al componente padre que se completó el registro
            if (onSuccess) {
                onSuccess(userData);
            }
        } catch (err) {
            console.error('Error al registrar datos del lead:', err);
            setSubmitError('Ocurrió un inconveniente al guardar los datos. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalContent = (
        <div 
            className="llm-modal-overlay" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="llm-modal-title"
        >
            <div className="llm-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Borde superior dorado visual */}
                <div className="llm-gold-accent-bar" aria-hidden="true" />

                {/* Badge superior */}
                <div className="llm-badge">
                    <Sparkles size={14} className="llm-badge-icon" />
                    <span>DATOS DEL DIAGNÓSTICO</span>
                </div>

                {/* Título y subtítulo */}
                <h2 id="llm-modal-title" className="llm-title">
                    Datos de quien realiza el diagnóstico
                </h2>
                <p className="llm-subtitle">
                    Ingresa los datos de la persona que realiza el diagnóstico para asociar su perfil, personalizar su informe y recibir acompañamiento.
                </p>

                {/* Mensaje de error en caso de fallo */}
                {submitError && (
                    <div className="llm-error-box animate-fade-in" role="alert">
                        <AlertTriangle size={18} />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="llm-form" noValidate>
                    <div className="llm-grid">
                        {/* Nombre y apellido */}
                        <div className="llm-field">
                            <label htmlFor="llm-name">
                                <User size={15} /> Nombre y apellido
                            </label>
                            <input
                                id="llm-name"
                                type="text"
                                placeholder="Nombre y apellido"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="llm-input"
                                autoFocus
                            />
                        </div>

                        {/* Correo electrónico */}
                        <div className="llm-field">
                            <label htmlFor="llm-email">
                                <Mail size={15} /> Correo electrónico
                            </label>
                            <input
                                id="llm-email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="llm-input"
                            />
                        </div>

                        {/* Número de teléfono */}
                        <div className="llm-field">
                            <label htmlFor="llm-phone">
                                <Phone size={15} /> Número de teléfono
                            </label>
                            <input
                                id="llm-phone"
                                type="tel"
                                placeholder="Ej. +57 300 123 4567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="llm-input"
                            />
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="llm-field">
                            <label htmlFor="llm-birth-day">
                                <Calendar size={15} /> Fecha de nacimiento
                            </label>
                            <div className="llm-date-grid">
                                <select
                                    id="llm-birth-day"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    required
                                    className="llm-select"
                                    aria-label="Día de nacimiento"
                                >
                                    <option value="" disabled>Día</option>
                                    {days.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>

                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    required
                                    className="llm-select"
                                    aria-label="Mes de nacimiento"
                                >
                                    <option value="" disabled>Mes</option>
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                    className="llm-select"
                                    aria-label="Año de nacimiento"
                                >
                                    <option value="" disabled>Año</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Botón de envío */}
                    <div className="llm-btn-wrapper">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="llm-submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="llm-spinner" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> Guardar datos
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default TemperamentoLeadModal;

