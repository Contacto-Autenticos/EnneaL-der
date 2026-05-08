import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    Environment, 
    Float, 
    ContactShadows, 
    useTexture,
    OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Constants for proportions
const PAGE_WIDTH = 4.2;
const PAGE_HEIGHT = 6;
const PAGE_SEGMENTS = 32;

const SinglePage = ({ index, textureUrl, isOpen, totalPages }) => {
    const groupRef = useRef();
    const meshRef = useRef();
    
    // Load texture with fallback
    const texture = useTexture(textureUrl);
    if (texture) {
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding;
    }

    useEffect(() => {
        // Closed: Stacked with very slight spread
        // Open: Flipped to the left (-180 deg)
        const targetRotation = isOpen ? -Math.PI + (index * 0.005) : (index * -0.005);
        gsap.to(groupRef.current.rotation, {
            y: targetRotation,
            duration: 1.8,
            ease: "power2.inOut",
            delay: isOpen ? index * 0.05 : (totalPages - index) * 0.05
        });
    }, [isOpen, index, totalPages]);

    useFrame(() => {
        if (!meshRef.current) return;
        
        // Simpler curvature for better performance and stability
        const currentRot = groupRef.current.rotation.y;
        const targetRot = isOpen ? -Math.PI : 0;
        const diff = Math.abs(currentRot - targetRot);
        const bendStrength = Math.sin(diff) * 0.4;
        
        const pos = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const distFromHinge = x + PAGE_WIDTH / 2;
            const z = bendStrength * (distFromHinge / PAGE_WIDTH);
            pos.setZ(i, z);
        }
        pos.needsUpdate = true;
    });

    return (
        <group ref={groupRef} position={[PAGE_WIDTH / 2, 0, index * 0.01]}>
            <group position={[-PAGE_WIDTH / 2, 0, 0]}>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, PAGE_SEGMENTS, 2]} />
                    <meshStandardMaterial 
                        map={texture} 
                        side={THREE.DoubleSide} 
                        roughness={0.8}
                        metalness={0.1}
                    />
                </mesh>
            </group>
        </group>
    );
};

const BookScene = ({ isOpen }) => {
    const bookGroup = useRef();

    const textures = [
        '/portada-autodiagnostico.png',
        '/Reporte_Fascinantes_page-0001.jpg',
        '/Reporte_Fascinantes_page-0002.jpg',
        '/Reporte_Fascinantes_page-0003.jpg',
        '/Reporte_Fascinantes_page-0004.jpg',
    ];

    useEffect(() => {
        if (isOpen) {
            // Central and larger when open
            gsap.to(bookGroup.current.position, { x: 0, y: 0.2, z: 1, duration: 2, ease: "power3.inOut" });
            gsap.to(bookGroup.current.rotation, { x: 0.1, y: 0, z: 0, duration: 2, ease: "power3.inOut" });
        } else {
            // Tilted and inviting when closed
            gsap.to(bookGroup.current.position, { x: 0, y: -0.2, z: 0, duration: 1.5, ease: "power2.inOut" });
            gsap.to(bookGroup.current.rotation, { x: -0.1, y: -0.4, z: 0.05, duration: 1.5, ease: "power2.inOut" });
        }
    }, [isOpen]);

    return (
        <group ref={bookGroup}>
            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                <Suspense fallback={<mesh><boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 0.1]} /><meshStandardMaterial color="#222" /></mesh>}>
                    {textures.map((url, i) => (
                        <SinglePage 
                            key={i} 
                            index={i} 
                            textureUrl={url} 
                            isOpen={isOpen} 
                            totalPages={textures.length}
                        />
                    ))}
                </Suspense>
                
                {/* Lomo (Spine) */}
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.2, PAGE_HEIGHT, 0.1]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
                </mesh>
            </Float>
        </group>
    );
};

const PremiumBook3D = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="premium-book-section" style={{ 
            height: '100vh', 
            width: '100%', 
            background: '#050505',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 12], fov: 35 }}>
                <ambientLight intensity={0.8} />
                <spotLight 
                    position={[15, 20, 15]} 
                    angle={0.3} 
                    penumbra={1} 
                    intensity={3} 
                    castShadow 
                />
                <pointLight position={[-10, 5, 10]} color="#ddbe3d" intensity={1} />
                
                <BookScene isOpen={isOpen} />

                <ContactShadows 
                    position={[0, -4, 0]} 
                    opacity={0.7} 
                    scale={20} 
                    blur={3} 
                    far={5} 
                />
                
                <Environment preset="night" />
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 2.5}
                />
            </Canvas>

            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}>
                {!isOpen ? (
                    <button 
                        onClick={() => setIsOpen(true)}
                        style={{
                            background: '#ddbe3d',
                            color: '#000',
                            padding: '18px 45px',
                            borderRadius: '50px',
                            fontSize: '14px',
                            fontWeight: '900',
                            letterSpacing: '3px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(221, 190, 61, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        EXPLORAR REPORTE
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '12px 30px',
                            borderRadius: '50px',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        CERRAR LIBRO
                    </button>
                )}
            </div>
        </section>
    );
};

export default PremiumBook3D;
