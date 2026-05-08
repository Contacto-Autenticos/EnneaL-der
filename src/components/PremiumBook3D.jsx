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
const PAGE_SEGMENTS = 48;
const PAGE_DEPTH = 0.01;

const SinglePage = ({ index, textureUrl, isOpen, isActive, onFlip, totalPages }) => {
    const groupRef = useRef();
    const meshRef = useRef();
    const texture = useTexture(textureUrl);
    
    // Back side texture (blank paper)
    const backTexture = useTexture('/Reporte_Fascinantes_page-0001.jpg'); // Placeholder or specific back texture

    // Animation state
    const [rotationY, setRotationY] = useState(0);

    useEffect(() => {
        // If this page should be open (all previous pages + current if flipped)
        const targetRotation = isOpen ? -Math.PI + (index * 0.01) : (index * -0.01);
        gsap.to(groupRef.current.rotation, {
            y: targetRotation,
            duration: 1.8,
            ease: "power2.inOut",
            delay: isOpen ? index * 0.1 : (totalPages - index) * 0.1
        });
    }, [isOpen, index, totalPages]);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        // Dynamic curvature during flip
        const currentRot = groupRef.current.rotation.y;
        const targetRot = isOpen ? -Math.PI : 0;
        const diff = Math.abs(currentRot - targetRot);
        
        // Bend strength based on movement and position in the stack
        const bendStrength = Math.sin(diff) * 0.6;
        
        const pos = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const distFromHinge = x + PAGE_WIDTH / 2;
            // Parabolic bend
            const z = bendStrength * Math.pow(distFromHinge / PAGE_WIDTH, 1.5);
            pos.setZ(i, z);
        }
        pos.needsUpdate = true;
    });

    return (
        <group ref={groupRef} position={[PAGE_WIDTH / 2, 0, index * 0.02]}>
            <group position={[-PAGE_WIDTH / 2, 0, 0]}>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <planeGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, PAGE_SEGMENTS, 2]} />
                    <meshStandardMaterial 
                        map={texture} 
                        side={THREE.FrontSide} 
                        roughness={0.8}
                        metalness={0.05}
                    />
                    <meshStandardMaterial 
                        color="#f5f5f5"
                        side={THREE.BackSide} 
                        roughness={0.9}
                    />
                </mesh>
            </group>
        </group>
    );
};

const BookScene = ({ isOpen, setOpen }) => {
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
            gsap.to(bookGroup.current.position, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.inOut" });
            gsap.to(bookGroup.current.rotation, { x: 0.2, y: 0, z: 0, duration: 2, ease: "power3.inOut" });
        } else {
            gsap.to(bookGroup.current.position, { x: 0, y: -0.5, z: -2, duration: 1.5, ease: "power2.inOut" });
            gsap.to(bookGroup.current.rotation, { x: -0.3, y: -0.2, z: 0.1, duration: 1.5, ease: "power2.inOut" });
        }
    }, [isOpen]);

    return (
        <group ref={bookGroup}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
                {textures.map((url, i) => (
                    <SinglePage 
                        key={i} 
                        index={i} 
                        textureUrl={url} 
                        isOpen={isOpen} 
                        totalPages={textures.length}
                    />
                ))}
                
                {/* Lomo (Spine) */}
                <mesh position={[-0.05, 0, 0]} castShadow>
                    <boxGeometry args={[0.15, PAGE_HEIGHT, 0.15]} />
                    <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
                </mesh>
            </Float>
        </group>
    );
};

const PremiumBook3D = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="premium-book-section" style={{ 
            height: '100vh', 
            width: '100%', 
            background: '#0a0a0a',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Background cinematic lighting via CSS */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 40%, rgba(221, 190, 61, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 40 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.4} />
                    <spotLight 
                        position={[10, 15, 10]} 
                        angle={0.3} 
                        penumbra={1} 
                        intensity={2} 
                        castShadow 
                        shadow-mapSize={[2048, 2048]}
                    />
                    <pointLight position={[-10, -10, -10]} color="#ddbe3d" intensity={0.5} />
                    
                    <BookScene isOpen={isOpen} setOpen={setIsOpen} />

                    <ContactShadows 
                        position={[0, -3.8, 0]} 
                        opacity={0.6} 
                        scale={25} 
                        blur={2.5} 
                        far={4.5} 
                    />
                    
                    <Environment preset="city" />
                    
                    <Particles count={60} />
                    
                    {isOpen && <OrbitControls 
                        enablePan={false} 
                        minDistance={5} 
                        maxDistance={12} 
                        maxPolarAngle={Math.PI / 1.8}
                        minPolarAngle={Math.PI / 3}
                    />}
                </Suspense>
            </Canvas>

            {/* User Interface Overlay */}
            <div className={`book-ui-layer ${isOpen ? 'is-open' : ''}`} style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}>
                {!isOpen && (
                    <button 
                        onClick={() => setIsOpen(true)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            pointerEvents: 'auto',
                            background: 'transparent',
                            border: '1px solid rgba(221, 190, 61, 0.4)',
                            color: '#ddbe3d',
                            padding: '16px 40px',
                            borderRadius: '50px',
                            fontSize: '14px',
                            fontWeight: '700',
                            letterSpacing: '5px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isHovered ? '0 0 30px rgba(221, 190, 61, 0.2)' : 'none',
                            transform: `translateY(280px) scale(${isHovered ? 1.05 : 1})`,
                            backdropFilter: 'blur(10px)',
                            marginTop: 'auto',
                            marginBottom: '60px'
                        }}
                    >
                        EXPLORAR REPORTE
                    </button>
                )}

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        display: 'flex',
                        gap: '20px',
                        pointerEvents: 'auto'
                    }}>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: '10px 24px',
                                borderRadius: '30px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            Cerrar Libro
                        </button>
                    </div>
                )}
            </div>
            
            <style>{`
                .premium-book-section {
                    user-select: none;
                }
                .book-ui-layer button:hover {
                    background: rgba(221, 190, 61, 0.1) !important;
                    border-color: #ddbe3d !important;
                }
            `}</style>
        </section>
    );
};

const Particles = ({ count }) => {
    const mesh = useRef();
    const light = useRef();
    
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -5 + Math.random() * 10;
            const yFactor = -5 + Math.random() * 10;
            const zFactor = -5 + Math.random() * 10;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ddbe3d" transparent opacity={0.2} />
        </instancedMesh>
    );
};

export default PremiumBook3D;
