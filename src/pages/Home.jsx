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
                        src="/Circulo Eneagrama - Autenticos.png"
                        alt="Logo Eneagrama - Autenticos"
                        className="home-logo animate-fade-in"
                    />
                </div>

                <h1 className="home-title">
                    Eneagrama & Liderazgo
                </h1>
                <p className="home-description">
                    Descubre quién eres y cuál es tu estilo de liderazgo dominante a través de un test breve, visual y emocional.
                </p>

                <button
                    onClick={() => navigate('/register')}
                    className="btn-start"
                >
                    Comenzar Test <ArrowRight size={19} />
                </button>
            </div>

            <div className="home-footer">
                <img
                    src="/Auténticos - Logo Azul-OP2.png"
                    alt="Auténticos Logo Azul"
                    className="home-footer-logo"
                />
            </div>
        </div>
    );
};

export default Home;
