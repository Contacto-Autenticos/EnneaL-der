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

                <h1 className="home-title">
                    Eneagrama & Liderazgo
                </h1>
                <p className="home-description">
                    Descubre quién eres y <br />
                    cuál es tu estilo de liderazgo.
                </p>

                <button
                    onClick={() => navigate('/test')}
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
