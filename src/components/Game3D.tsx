import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Sky, Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
  position: [number, number, number];
  onPositionChange: (pos: [number, number, number]) => void;
}

function Player({ position, onPositionChange }: PlayerProps) {
  const moveSpeed = 0.1;
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useFrame((state) => {
    const camera = state.camera;
    const newPosition = [...position] as [number, number, number];
    
    if (keysPressed.current['w'] || keysPressed.current['W']) {
      newPosition[0] -= Math.sin(camera.rotation.y) * moveSpeed;
      newPosition[2] -= Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keysPressed.current['s'] || keysPressed.current['S']) {
      newPosition[0] += Math.sin(camera.rotation.y) * moveSpeed;
      newPosition[2] += Math.cos(camera.rotation.y) * moveSpeed;
    }
    if (keysPressed.current['a'] || keysPressed.current['A']) {
      newPosition[0] -= Math.cos(camera.rotation.y) * moveSpeed;
      newPosition[2] += Math.sin(camera.rotation.y) * moveSpeed;
    }
    if (keysPressed.current['d'] || keysPressed.current['D']) {
      newPosition[0] += Math.cos(camera.rotation.y) * moveSpeed;
      newPosition[2] -= Math.sin(camera.rotation.y) * moveSpeed;
    }

    newPosition[0] = Math.max(-50, Math.min(50, newPosition[0]));
    newPosition[2] = Math.max(-50, Math.min(50, newPosition[2]));

    if (newPosition[0] !== position[0] || newPosition[2] !== position[2]) {
      onPositionChange(newPosition);
    }

    camera.position.set(newPosition[0], newPosition[1], newPosition[2]);
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      keysPressed.current[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      keysPressed.current[e.key] = false;
    });
  }

  return null;
}

function OzonBuilding() {
  return (
    <group position={[0, 0, -15]}>
      <Box args={[12, 5, 8]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
      
      <Box args={[3, 4, 0.2]} position={[0, 2, 4.1]}>
        <meshStandardMaterial color="#0EA5E9" />
      </Box>
      
      <Text
        position={[0, 3.5, 4.2]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        OZON ПВЗ
      </Text>

      <Box args={[2, 3, 0.1]} position={[0, 1.5, 4.1]}>
        <meshStandardMaterial color="#333333" transparent opacity={0.3} />
      </Box>

      <Box args={[10, 0.1, 6]} position={[0, 5.05, 0]}>
        <meshStandardMaterial color="#888888" />
      </Box>
    </group>
  );
}

function InteriorWarehouse() {
  const shelves = [];
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      shelves.push(
        <group key={`shelf-${i}-${j}`} position={[-8 + i * 5, 1.5, -20 + j * 3]}>
          <Box args={[1.5, 3, 1]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          <Box args={[0.4, 0.4, 0.4]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#F97316" />
          </Box>
          <Text
            position={[0, -1, 0.6]}
            fontSize={0.2}
            color="white"
            anchorX="center"
          >
            {`${String.fromCharCode(65 + i)}-${j + 1}${Math.floor(Math.random() * 9)}`}
          </Text>
        </group>
      );
    }
  }

  return (
    <group>
      {shelves}
      
      <Plane args={[25, 25]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <meshStandardMaterial color="#dddddd" />
      </Plane>
      
      <Box args={[25, 0.1, 25]} position={[0, 4, -20]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>

      <pointLight position={[0, 3.5, -20]} intensity={150} distance={20} />
      <pointLight position={[-8, 3.5, -18]} intensity={100} distance={15} />
      <pointLight position={[8, 3.5, -18]} intensity={100} distance={15} />
    </group>
  );
}

function WorkStartZone({ playerPosition, onStartWork }: { playerPosition: [number, number, number]; onStartWork: () => void }) {
  const zonePosition: [number, number, number] = [0, 0.1, -11];
  const distance = Math.sqrt(
    Math.pow(playerPosition[0] - zonePosition[0], 2) +
    Math.pow(playerPosition[2] - zonePosition[2], 2)
  );

  const isNear = distance < 2;

  return (
    <>
      <Plane args={[2, 2]} rotation={[-Math.PI / 2, 0, 0]} position={zonePosition}>
        <meshStandardMaterial 
          color={isNear ? "#00ff00" : "#0EA5E9"} 
          transparent 
          opacity={0.6}
          emissive={isNear ? "#00ff00" : "#0EA5E9"}
          emissiveIntensity={isNear ? 0.5 : 0.2}
        />
      </Plane>
      
      {isNear && (
        <Text
          position={[zonePosition[0], 2, zonePosition[2]]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          Нажмите E - Начать работу
        </Text>
      )}
    </>
  );
}

interface Game3DProps {
  onStartWork: () => void;
}

export default function Game3D({ onStartWork }: Game3DProps) {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1.7, 5]);
  const [locked, setLocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebGLSupported(!!gl);
  }, []);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'e' || e.key === 'E') {
      const zonePosition: [number, number, number] = [0, 0, -11];
      const distance = Math.sqrt(
        Math.pow(playerPosition[0] - zonePosition[0], 2) +
        Math.pow(playerPosition[2] - zonePosition[2], 2)
      );
      
      if (distance < 2) {
        onStartWork();
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.removeEventListener('keypress', handleKeyPress);
    window.addEventListener('keypress', handleKeyPress);
  }

  if (isMobile || !webGLSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center space-y-6">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900">3D-режим недоступен</h2>
          <p className="text-gray-600">
            {!webGLSupported 
              ? 'Ваш браузер не поддерживает WebGL для 3D-графики.'
              : 'На мобильных устройствах 3D-режим не поддерживается.'}
          </p>
          <p className="text-gray-600">
            Но вы можете сразу перейти к работе!
          </p>
          <button
            onClick={onStartWork}
            className="w-full bg-primary text-white py-4 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Начать работу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ position: playerPosition, fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#4a7c59" />
        </Plane>

        <Plane args={[20, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -5]}>
          <meshStandardMaterial color="#666666" />
        </Plane>

        <OzonBuilding />
        <InteriorWarehouse />
        <WorkStartZone playerPosition={playerPosition} onStartWork={onStartWork} />

        <Player position={playerPosition} onPositionChange={setPlayerPosition} />
        
        <PointerLockControls 
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />
      </Canvas>

      {!locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="bg-white p-6 rounded-lg text-center pointer-events-auto">
            <h2 className="text-2xl font-bold mb-4">Кликните для входа в игру</h2>
            <p className="text-muted-foreground mb-2">WASD - движение</p>
            <p className="text-muted-foreground mb-2">Мышь - осмотр</p>
            <p className="text-muted-foreground">E - взаимодействие</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">Позиция: X: {playerPosition[0].toFixed(1)} Z: {playerPosition[2].toFixed(1)}</p>
      </div>
    </div>
  );
}