import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import carModelPath from "../3D/mercedes_amg_petronas__w14_2023 (1).glb?url";

// Load the 3D model
function CarModel() {
  const { scene } = useGLTF(carModelPath);
  const carRef = useRef<THREE.Group>(null);

  // Rotate the car slowly
  useFrame((state) => {
    if (carRef.current) {
      carRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <primitive
      ref={carRef}
      object={scene}
      scale={[1.85, 1.85, 1.85]}
      position={[0, 0, 0]}
    />
  );
}

// Preload the model
useGLTF.preload(carModelPath);

const Car3D = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ 
        antialias: true, 
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.5
      }}
    >
      <ambientLight intensity={2.0} />
      <directionalLight position={[10, 10, 5]} intensity={4.0} />
      <directionalLight position={[-10, 10, 5]} intensity={3.0} />
      <pointLight position={[-10, -10, -5]} intensity={2.5} />
      <pointLight position={[10, 10, -5]} intensity={2.5} />
      <pointLight position={[0, 10, 0]} intensity={2.0} />
      <spotLight position={[0, 15, 0]} angle={0.5} intensity={3.0} />
      <CarModel />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
};

export default Car3D;

