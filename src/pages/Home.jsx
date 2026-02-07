import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (


        <div className="container home-container">
            <div className="home-logo-container">
                <img
                    src="/gold-logo.png"
                    alt="Logo Eneagrama Dorado"
                    className="home-logo"
                />
            </div>

            <h1 className="home-title">
                Eneagrama & Liderazgo
            </h1>
            <p className="home-description">
                Descubre quien eres y cual es tu estilo de liderazgo dominante a través de un test breve, visual y emocional.
            </p>

            <button
                onClick={() => navigate('/register')}
                className="btn-start"
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
