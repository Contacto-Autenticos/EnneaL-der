import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (


        <div className="container home-container">
            <div className="home-content-wrapper">
                <div className="home-logo-container">
                    <img
                        src="/eneagrama_new.png"
                        alt="Logo Eneagrama - Autenticos"
                        className="home-logo animate-zoom-in-slow"
                    />
                </div>

                <div className="home-title-container">
                    <h1 className="home-title">
                        Enesencia
                    </h1>
                    <div className="home-subtitle-gold">
                        Eneagrama & liderazgo
                    </div>
                </div>
                <p className="home-description">
                    Descubre quién eres y <br />
                    cuál es tu estilo de liderazgo.
                </p>

                <button
                    onClick={() => navigate('/eneagrama-test-intro')}
                    className="btn-start"
                >
                    Iniciar ahora <ArrowRight size={19} />
                </button>


            </div>

            <div className="home-footer">
                <img
                    src="/logo-azul.png"
                    alt="Auténticos Logo Azul"
                    className="home-footer-logo"
                />
            </div>
        </div>
    );
};

export default Home;
