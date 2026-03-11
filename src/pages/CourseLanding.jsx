import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Lock,
    Rocket,
    Star
} from 'lucide-react';
import './CourseLanding.css';

const CourseLanding = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Apply body classes for styling if needed, similar to AdvancedLanding
        document.body.style.backgroundColor = '#002d44';
        document.body.style.color = '#ffffff';

        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };
    }, []);

    return (
        <div className="course-landing-container">
            <div className="al-bg-glow"></div>

            {/* Navigation */}
            <nav className="al-nav scrolled">
                <div className="al-nav-content">
                    <div className="al-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="al-logo" />
                    </div>
                    <div className="al-nav-links">
                        <span onClick={() => window.history.back()} className="al-nav-back-arrow" title="Volver">
                            <ArrowLeft size={16} />
                        </span>
                    </div>
                </div>
            </nav>

            {/* Hero / Intro Section */}
            <section className="al-hero al-animate">
                <div className="al-tag">
                    <Star size={14} /> PROGRAMA AVANZADO
                </div>

                <h1 className="al-hero-title">
                    <span className="al-hero-title-top">Descubre por qué piensas,</span>
                    <span className="al-gold-text">decides y reaccionas como lo haces.</span>
                </h1>

                <div className="course-intro-content">
                    <p className="al-hero-subtitle" style={{ fontSize: '1.2rem', fontWeight: '400', opacity: '0.9', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
                        Muchas personas sienten que repiten los mismos patrones en su vida sin entender por qué.
                    </p>
                    <p className="course-description-text">
                        El Eneagrama es uno de los mapas más profundos para comprender la personalidad humana y las motivaciones que dirigen nuestras decisiones.
                    </p>
                    <p className="course-description-text">
                        En este taller aprenderás a reconocer los patrones invisibles que influyen en tu forma de pensar, sentir y actuar.
                    </p>
                </div>

                <div className="al-hero-actions">
                    <a href="#precios" className="al-btn-main">
                        EXPLORAR EL PROGRAMA
                        <ArrowRight size={22} />
                    </a>
                </div>
            </section>

            {/* NEW: Introspection Section */}
            <section className="course-introspection al-animate">
                <div className="al-section-content">
                    <div className="introspection-box">
                        <h2 className="introspection-title">Muchas personas sienten que:</h2>
                        <ul className="introspection-list">
                            <li>repiten las mismas historias en sus relaciones</li>
                            <li>reaccionan de formas que luego lamentan</li>
                            <li>se exigen más de lo que deberían</li>
                            <li>toman decisiones que no entienden del todo</li>
                        </ul>

                        <div className="introspection-divider"></div>

                        <div className="introspection-question-wrapper">
                            <p className="introspection-transition">Con el tiempo aparece una pregunta inevitable:</p>
                            <h3 className="introspection-question">¿Por qué soy como soy?</h3>
                        </div>

                        <p className="introspection-closing">
                            El autoconocimiento comienza cuando dejamos de mirar solamente el mundo y empezamos a comprendernos a nosotros mismos.
                        </p>
                    </div>
                </div>
            </section>

            {/* NEW: Map Section */}
            <section className="course-map al-animate">
                <div className="al-section-content">
                    <div className="course-map-header">
                        <h2 className="al-hero-title">
                            <span className="al-hero-title-top">El Eneagrama es un</span>
                            <span className="al-gold-text">mapa de la personalidad</span>
                        </h2>
                        <p className="al-hero-subtitle" style={{ fontSize: '1.4rem', textAlign: 'center', margin: '0 auto' }}>
                            Describe nueve estructuras fundamentales de comportamiento.
                        </p>
                    </div>

                    <div className="course-map-highlights">
                        <p className="introspection-transition" style={{ marginBottom: '30px' }}>Más que etiquetas, revela:</p>

                        <div className="map-grid">
                            {[
                                'motivaciones profundas',
                                'miedos inconscientes',
                                'patrones emocionales',
                                'formas de interpretar la realidad'
                            ].map((item, i) => (
                                <div key={i} className="map-item">
                                    <div className="map-item-dot"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <p className="introspection-closing" style={{ marginTop: '50px' }}>
                            Comprender este mapa permite ver con mayor claridad cómo funciona nuestra mente y nuestras relaciones.
                        </p>
                    </div>
                </div>
            </section>
            {/* NEW: Experience Section */}
            <section className="course-experience al-animate">
                <div className="al-section-content">
                    <div className="introspection-box">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: '40px' }}>
                            <span className="al-hero-title-top">En esta experiencia</span>
                            <span className="al-gold-text">aprenderás a:</span>
                        </h2>

                        <ul className="introspection-list">
                            <li>comprender cómo se forman los patrones de personalidad</li>
                            <li>identificar tus motivaciones profundas</li>
                            <li>reconocer tus reacciones automáticas</li>
                            <li>entender mejor a las personas que te rodean</li>
                        </ul>

                        <div className="introspection-divider"></div>

                        <p className="introspection-closing" style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                            El objetivo no es etiquetarte, sino comprenderte con mayor profundidad.
                        </p>
                    </div>
                </div>
            </section>

            {/* NEW: Workshop Modalities Section */}
            <section className="course-modalities al-animate">
                <div className="al-section-content">
                    <div className="modalities-header">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}>
                            <span className="al-hero-title-top">Este taller es especialmente</span>
                            <span className="al-gold-text">valioso para personas que:</span>
                        </h2>

                        <div className="target-audience-grid">
                            {[
                                'sienten curiosidad por comprenderse mejor',
                                'desean mejorar sus relaciones',
                                'están atravesando momentos de cambio o decisiones importantes',
                                'lideran equipos o trabajan con personas',
                                'buscan herramientas prácticas de liderazgo consciente',
                                'quieren potenciar su desarrollo personal y profesional'
                            ].map((item, i) => (
                                <div key={i} className="target-item">
                                    <div className="target-dot"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modalities-choice-box">
                        <p className="introspection-transition text-center" style={{ marginBottom: '40px', fontSize: '1.2rem' }}>
                            Puedes acceder a este contenido de dos formas:
                        </p>

                        <div className="modality-cards">
                            <div className="modality-card">
                                <div className="modality-tag">EN LÍNEA</div>
                                <h3 className="modality-title">Taller virtual en vivo</h3>
                                <div className="modality-stats">
                                    <span>4 sesiones</span>
                                    <div className="stats-divider"></div>
                                    <span>2 horas por sesión</span>
                                </div>
                                <p>Un espacio de aprendizaje progresivo donde exploraremos el sistema completo del Eneagrama.</p>
                            </div>

                            <div className="modality-card card-featured">
                                <div className="modality-tag">Cali, Colombia</div>
                                <h3 className="modality-title">Taller presencial</h3>
                                <div className="modality-stats">
                                    <span>Jornada Intensiva</span>
                                    <div className="stats-divider"></div>
                                    <span>8 horas</span>
                                </div>
                                <p>Donde vivirás una experiencia profunda de autoconocimiento y comprensión de los patrones humanos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Instructor Section */}
            <section className="course-instructor al-animate">
                <div className="al-section-content">
                    <div className="instructor-flex">
                        <div className="instructor-image-container">
                            <div className="instructor-image-glow"></div>
                            <img src="/FB-Enesencia-1.jpg" alt="Felipe Beltrán" className="instructor-image" />
                        </div>

                        <div className="instructor-info">
                            <h2 className="instructor-name">
                                <span className="name-white">Felipe</span>
                                <span className="name-yellow"> Beltran Hernandez</span>
                            </h2>
                            <div className="instructor-divider"></div>
                            <p className="instructor-bio">
                                <strong>Conferencista internacional</strong> con más de 18 años de experiencia en liderazgo, innovación y desarrollo humano.
                            </p>
                            <p className="instructor-bio">
                                Ha acompañado procesos de formación en más de 30 ciudades y ha trabajado con miles de personas explorando cómo comprender mejor la naturaleza humana y el potencial personal.
                            </p>
                            <p className="instructor-bio testimony">
                                "A través del eneagrama empecé a comprender quién era, por qué pensaba, sentía y hacía las cosas de una determinada manera.
                            </p>
                            <p className="instructor-bio testimony">
                                Entonces dejé de juzgarme y empecé a aceptarme. Concentré mi energía en potenciar mis talentos naturales para ponerlos al servicio mío y de los demás."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Closing Section */}
            <section className="course-closing al-animate">
                <div className="al-section-content">
                    <div className="closing-box">
                        <p className="closing-lead">
                            Comprender cómo funciona tu personalidad puede cambiar la forma en que te relacionas contigo mismo y con los demás.
                        </p>

                        <div className="closing-statement">
                            <p>El autoconocimiento no es solo una idea.</p>
                            <p className="al-gold-text">Es una experiencia.</p>
                        </div>

                        <a href="#precios" className="al-btn-primary closing-cta">
                            RESERVA TU LUGAR EN EL TALLER
                        </a>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precios" className="al-section al-pricing-section">
                <div className="al-section-content">
                    <div className="al-pricing-wrapper al-animate">
                        {/* Tarjeta Virtual */}
                        <div className="al-pricing-card">
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header">
                                <h3>Programa Virtual</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        $360.000 <span className="al-currency">COP</span>
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        '4 Sesiones en vivo',
                                        'Guías de ejercicios prácticos',
                                        'Sesiones de Q&A grabadas',
                                        'Comunidad exclusiva',
                                        'Acceso de por vida a grabaciones',
                                        'Certificado de finalización'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>

                                <button className="al-btn-buy">
                                    Inscribirme Virtual <Lock size={24} />
                                </button>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0' }}>
                                    Acceso instantáneo • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>

                        {/* Tarjeta Presencial */}
                        <div className="al-pricing-card card-featured">
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header" style={{ background: '#002d44', color: '#ddbe3d' }}>
                                <h3>Programa Presencial</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        $597.000 <span className="al-currency">COP</span>
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        'Jornada Intensiva (8 horas)',
                                        'Material físico de trabajo',
                                        'Refrigerios incluidos',
                                        'Comunidad exclusiva presencial',
                                        'Networking con asistentes',
                                        'Certificado de finalización impreso'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>

                                <button className="al-btn-buy" style={{ background: '#002d44', color: '#ddbe3d', border: '1px solid #ddbe3d' }}>
                                    Inscribirme Presencial <Lock size={24} />
                                </button>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,200,200,0.8)', marginTop: '0', fontWeight: 'bold' }}>
                                    * NO INCLUYE COSTOS DE DESPLAZAMIENTO *
                                </p>
                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                                    Cupos limitados • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseLanding;
