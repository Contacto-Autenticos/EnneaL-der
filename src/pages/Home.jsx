import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (

        <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100vh',
            maxHeight: '100vh',
            padding: '1vh 20px',
            overflow: 'hidden'
        }}>
            <div style={{ flex: '0 0 auto', marginBottom: '2vh', marginTop: '2vh' }}>
                <img
                    src="/gold-logo.png"
                    alt="Logo Eneagrama Dorado"
                    style={{ maxWidth: '500px', width: '100%', height: 'auto', maxHeight: '52vh', objectFit: 'contain' }}
                />
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1vh', color: 'var(--color-primary)', lineHeight: 1.2 }}>
                Eneagrama & Liderazgo
            </h1>
            <p style={{ fontSize: '1.05rem', marginBottom: '3vh', maxWidth: '600px', lineHeight: 1.4 }}>
                Descubre quien eres y cual es tu estilo de liderazgo dominante a través de un test breve, visual y emocional.
            </p>

            <button
                onClick={() => navigate('/register')}
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '12px 35px',
                    fontSize: '1.15rem',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: 'var(--shadow-md)',
                    marginBottom: '1vh'
                }}
            >
                Comenzar Test <ArrowRight size={19} />
            </button>

            <div style={{ marginTop: 'auto', paddingBottom: '2vh' }}>
                <img
                    src="/logo-autenticos-azul.png"
                    alt="Auténticos Logo Azul"
                    style={{ maxWidth: '120px', height: 'auto', maxHeight: '10vh', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
};

export default Home;
