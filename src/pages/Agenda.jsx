import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  CheckCircle2, 
  X,
  Search,
  Video,
  ArrowLeft,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Phone,
  HelpCircle,
  Users
} from 'lucide-react';
import { gsap } from 'gsap';
import { supabase } from '../supabaseClient';
import './Agenda.css';

const Agenda = () => {
  const [view, setView] = useState('services'); // 'services' or 'calendar'
  const [selectedService, setSelectedService] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [busySlots, setBusySlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceRequired: '',
    guests: ''
  });

  const modalRef = useRef(null);
  const containerRef = useRef(null);

  const services = [
    {
      id: '15min',
      title: 'Sesión 15 minutos',
      description: 'Ideal para una consulta puntual, una pregunta específica o un primer contacto breve.',
      image: '/Reloj-1.png',
      duration: 15
    },
    {
      id: '30min',
      title: 'Sesión 30 minutos',
      description: 'Ideal para revisar una situación concreta, recibir orientación clara y definir próximos pasos.',
      image: '/Reloj-2.png',
      duration: 30
    },
    {
      id: '45min',
      title: 'Sesión 45 minutos',
      description: 'Ideal para profundizar en un reto, explorar alternativas y tomar decisiones estratégicas.',
      image: '/Reloj-3.png',
      duration: 45
    },
    {
      id: '60min',
      title: 'Sesión 60 minutos',
      description: 'Ideal para una conversación de mentoría, trabajo a fondo y construcción de acciones concretas.',
      image: '/Reloj-4.png',
      duration: 60
    }
  ];

  const generateSlots = (duration) => {
    const slots = [];
    const blocks = [
      { start: 9, end: 12 },   // 9:00 AM - 12:00 PM
      { start: 14, end: 17 }  // 2:00 PM - 5:00 PM (14:00 - 17:00)
    ];

    blocks.forEach(block => {
      let currentMinutes = block.start * 60;
      const endMinutes = block.end * 60;

      while (currentMinutes + duration <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        const timeStr = `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
        
        let isOverlapping = false;
        if (selectedDate) {
          const slotStart = new Date(selectedDate);
          slotStart.setHours(hours, mins, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          for (const busy of busySlots) {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            
            if (slotStart < busyEnd && slotEnd > busyStart) {
              isOverlapping = true;
              break;
            }
          }
        }

        if (!isOverlapping) {
          slots.push(timeStr);
        }
        currentMinutes += duration;
      }
    });
    return slots;
  };

  const availableSlots = selectedService ? generateSlots(selectedService.duration) : [];

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) {
        setBusySlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const payload = { 
          date: selectedDate.toISOString(), 
          operatorEmail: 'felipebeltranh@gmail.com' 
        };
        
        const { data, error } = await supabase.functions.invoke('check-calendar-availability', {
          body: payload
        });

        if (error) throw error;
        
        if (data && data.busy) {
          setBusySlots(data.busy);
        } else {
          setBusySlots([]);
        }
      } catch (error) {
        console.error("Error fetching calendar availability:", error);
        setBusySlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [view]);

  useEffect(() => {
    if (showBookingForm && modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [showBookingForm]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isPast ? 'past' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'active' : ''}`}
          onClick={() => !isPast && setSelectedDate(date)}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse selectedSlot "09:00 AM" to hours and minutes
      const [time, ampm] = selectedSlot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceRequired: formData.serviceRequired || selectedService.title,
        guests: formData.guests,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        operatorEmail: 'felipebeltranh@gmail.com'
      };

      const { data, error } = await supabase.functions.invoke('create-calendar-event', {
        body: payload
      });

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Hubo un error al agendar la cita. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setView('calendar');
  };

  return (
    <div className="agenda-page">
      <div className="agenda-container" ref={containerRef}>
        
        {view === 'services' ? (
          <div className="services-view">
            <div className="services-view-header">
              <h1 className="services-title">Elija el espacio que desea reservar</h1>
            </div>

            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-img-container">
                    <img src={service.image} alt={service.title} className="service-img" />
                    <div className="service-avatar-badge">
                      <span className="avatar-name">Felipe Beltrán Hernández</span>
                    </div>
                  </div>
                  <div className="service-content">
                    <h3 className="service-type-title">{service.title}</h3>
                    <div className="service-online-badge">
                      <Video size={14} />
                      <span>En línea</span>
                    </div>
                    <p className="service-description">{service.description}</p>
                    <button 
                      className="btn-reserve-now"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Reservar ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="calendar-view">
            <div className="back-to-services" onClick={() => setView('services')}>
              <ArrowLeft size={18} />
              <span>Volver a servicios</span>
            </div>
            <div className="calendar-layout">
              {/* Left Sidebar: Meeting Details */}
              <div className="meeting-details-sidebar">
                <div className="flex flex-col gap-4 mb-6 items-start">
                  <img src={selectedService?.image} alt={selectedService?.title} className="rounded-lg object-cover border border-gray-200" />
                  <h2 className="text-xl font-bold text-secondary">{selectedService?.title}</h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Detalles de la reunión</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Video size={16} />
                      <span className="text-sm">En línea</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} />
                      <span className="text-sm">{selectedService?.duration} minutos</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 mb-6" />

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Operador</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                       <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-secondary">Felipe Beltrán Hernández</h4>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} />
                      <span className="text-sm">contacto@autenticos.co</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} />
                      <span className="text-sm">3153514590</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Calendar */}
              <div className="flex flex-col gap-4">
                <div className="calendar-wrapper">
                  <div className="calendar-nav">
                    <h3 className="calendar-current-month">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="calendar-nav-actions">
                      <button onClick={handlePrevMonth} className="calendar-nav-btn">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={handleNextMonth} className="calendar-nav-btn">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="calendar-grid">
                    {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map(d => (
                      <div key={d} className="calendar-weekday">{d}</div>
                    ))}
                    {renderCalendar()}
                  </div>
                </div>

                <div className="timezone-wrapper">
                  <Globe size={16} />
                  <span>Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
              </div>

              {/* Right Side: Slots */}
              <div className="slots-wrapper">
                <div className="slots-title">
                  <Clock size={24} className="text-gold" />
                  <span>Horarios Disponibles</span>
                </div>
                
                {selectedDate ? (
                  <>
                    <p className="selected-date-text">
                      Para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {isLoadingSlots ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mb-4" style={{borderTopColor: 'transparent'}}></div>
                        <p className="text-gray-500 text-sm">Buscando horarios disponibles...</p>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="slots-grid">
                        {availableSlots.map(slot => (
                          <button 
                            key={slot}
                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg">
                        <CalendarIcon size={32} className="text-gray-400 mb-3 opacity-50" />
                        <p className="text-gray-600 font-medium">No hay horarios disponibles</p>
                        <p className="text-gray-400 text-sm mt-1">Todos los espacios para este día están ocupados. Por favor, selecciona otra fecha.</p>
                      </div>
                    )}
                    
                    {selectedSlot && (
                      <button 
                        className="btn-confirm w-full mt-4"
                        onClick={() => setShowBookingForm(true)}
                      >
                        Continuar con la Reserva
                      </button>
                    )}
                  </>
                ) : (
                  <div className="no-slots-msg">
                    <CalendarIcon size={40} className="mx-auto mb-4 opacity-20" />
                    <p>Selecciona una fecha para ver los horarios disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Form Modal (same as before) */}
      {showBookingForm && (
        <div className="booking-overlay">
          <div className="booking-modal" ref={modalRef}>
            <button className="modal-close" onClick={() => setShowBookingForm(false)}>
              <X size={24} />
            </button>

            {!isSuccess ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-secondary">Confirma tu Cita</h2>
                
                <div className="booking-summary">
                  <div className="summary-item">
                    <CalendarIcon size={18} className="text-gold" />
                    <span>{selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="summary-item">
                    <Clock size={18} className="text-gold" />
                    <span>{selectedSlot} ({selectedService?.title})</span>
                  </div>
                </div>

                <form className="booking-form" onSubmit={handleBooking}>
                  <div className="form-group">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                      <User size={16} className="text-gray-400" />
                      Nombre Completo
                    </label>
                    <input 
                      type="text" 
                      required
                      className="booking-input"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                      <Mail size={16} className="text-gray-400" />
                      Correo Electrónico
                    </label>
                    <input 
                      type="email" 
                      required
                      className="booking-input"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                      <Phone size={16} className="text-gray-400" />
                      Teléfono
                    </label>
                    <input 
                      type="tel" 
                      required
                      className="booking-input"
                      placeholder="Tu número de teléfono"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                      <HelpCircle size={16} className="text-gray-400" />
                      ¿Qué servicio requiere?
                    </label>
                    <input 
                      type="text" 
                      required
                      className="booking-input"
                      placeholder="Ej: Asesoría, Consulta general..."
                      value={formData.serviceRequired}
                      onChange={e => setFormData({...formData, serviceRequired: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <button 
                      type="button" 
                      onClick={() => setShowGuests(!showGuests)}
                      className="text-sm font-semibold text-color-primary flex items-center gap-2 hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <Users size={16} /> 
                      Añadir invitados a la reunión (opcional)
                      <span className="text-xs">{showGuests ? '▲' : '▼'}</span>
                    </button>
                    {showGuests && (
                      <div className="mt-3">
                        <input 
                          type="text" 
                          className="booking-input"
                          placeholder="Emails separados por comas"
                          value={formData.guests}
                          onChange={e => setFormData({...formData, guests: e.target.value})}
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="btn-confirm"
                    disabled={loading}
                  >
                    {loading ? "Confirmando..." : "Finalizar Reserva"}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-view">
                <div className="success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-secondary">¡Cita Agendada!</h2>
                <p className="text-gray-600">
                  Hemos enviado los detalles de tu sesión al correo <strong>{formData.email}</strong>.
                </p>
                <button 
                  className="btn-confirm w-full mt-4"
                  onClick={() => {
                    setShowBookingForm(false);
                    setIsSuccess(false);
                    setSelectedSlot(null);
                    setView('services');
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ 
        padding: '50px 24px', 
        background: '#ffffff', 
        textAlign: 'center',
        borderTop: '1px solid rgba(0, 45, 68, 0.05)',
        width: '100%',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <img 
            src="/logo-azul.png" 
            alt="Auténticos" 
            style={{ 
              height: '38px', 
              marginBottom: '25px',
              opacity: '1'
            }} 
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            marginBottom: '0px'
          }}>
            <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer" style={{ color: '#ddbe3d' }}><Globe size={24} /></a>
            <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer" style={{ color: '#ddbe3d' }}><Instagram size={24} /></a>
            <a href="https://www.facebook.com/clubautenticos" target="_blank" rel="noopener noreferrer" style={{ color: '#ddbe3d' }}><Facebook size={24} /></a>
            <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer" style={{ color: '#ddbe3d' }}><Youtube size={24} /></a>
            <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer" style={{ color: '#ddbe3d' }}><Linkedin size={24} /></a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Agenda;
