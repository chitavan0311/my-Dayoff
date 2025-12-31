
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Gamepad2, Trophy, RefreshCw, ArrowLeftRight } from 'lucide-react';

const GameZone: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (!containerRef.current || gameOver) return;

    const width = containerRef.current.clientWidth;
    const height = 500;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Grid Floor
    const grid = new THREE.GridHelper(100, 20, 0x334155, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Player (Student Cube)
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x0d9488 }); // Teal-600
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.5, 0);
    scene.add(player);

    let currentLane = 0; // -1: Left, 0: Center, 1: Right
    const laneWidth = 3;

    // Game Objects arrays
    const obstacles: THREE.Mesh[] = [];
    const coins: THREE.Mesh[] = [];

    // Spawning logic
    const spawnObstacle = () => {
      const geometry = new THREE.BoxGeometry(1.5, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color: 0xe11d48 }); // Rose-600
      const mesh = new THREE.Mesh(geometry, material);
      const lane = Math.floor(Math.random() * 3) - 1;
      mesh.position.set(lane * laneWidth, 0.5, -40);
      scene.add(mesh);
      obstacles.push(mesh);
    };

    const spawnCoin = () => {
      const geometry = new THREE.SphereGeometry(0.4, 16, 16);
      const material = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 }); // Emerald-500
      const mesh = new THREE.Mesh(geometry, material);
      const lane = Math.floor(Math.random() * 3) - 1;
      mesh.position.set(lane * laneWidth, 1, -40);
      scene.add(mesh);
      coins.push(mesh);
    };

    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') currentLane = Math.max(-1, currentLane - 1);
      if (e.key === 'ArrowRight' || e.key === 'd') currentLane = Math.min(1, currentLane + 1);
    };
    window.addEventListener('keydown', handleKeyDown);

    // Game loop
    let frame = 0;
    let speed = 0.2;
    let localScore = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      frame++;

      // Gradually increase speed
      speed += 0.0001;

      // Spawn items
      if (frame % 60 === 0) spawnObstacle();
      if (frame % 100 === 0) spawnCoin();

      // Smooth lane movement
      player.position.x = THREE.MathUtils.lerp(player.position.x, currentLane * laneWidth, 0.2);

      // Move and check collisions for obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += speed;

        // Collision detection (Bounding Box)
        const playerBox = new THREE.Box3().setFromObject(player);
        const obsBox = new THREE.Box3().setFromObject(obs);

        if (playerBox.intersectsBox(obsBox)) {
          setGameOver(true);
          cancelAnimationFrame(animationFrameId);
        }

        if (obs.position.z > 15) {
          scene.remove(obs);
          obstacles.splice(i, 1);
        }
      }

      // Move and check collisions for coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.position.z += speed;
        coin.rotation.y += 0.05;

        const playerBox = new THREE.Box3().setFromObject(player);
        const coinBox = new THREE.Box3().setFromObject(coin);

        if (playerBox.intersectsBox(coinBox)) {
          localScore += 10;
          setScore(localScore);
          scene.remove(coin);
          coins.splice(i, 1);
        }

        if (coin.position.z > 15) {
          scene.remove(coin);
          coins.splice(i, 1);
        }
      }

      // Move floor grid back to simulate movement
      grid.position.z += speed;
      if (grid.position.z > 5) grid.position.z = 0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [gameOver]);

  const resetGame = () => {
    if (score > highScore) setHighScore(score);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Gamepad2 className="text-indigo-600" size={32} />
            Break Zone
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-wider text-xs flex items-center gap-2">
            Leave Runner: Collect Approvals, Avoid Red Tape
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Leave Balance</p>
            <p className="text-xl font-black text-teal-600">{score}</p>
          </div>
          <div className="bg-indigo-600 px-6 py-2 rounded-2xl shadow-lg shadow-indigo-100 text-center text-white">
            <p className="text-[10px] font-black opacity-60 uppercase">High Score</p>
            <p className="text-xl font-black">{highScore}</p>
          </div>
        </div>
      </div>

      <div className="relative rounded-[48px] overflow-hidden border-8 border-white shadow-2xl bg-slate-900 h-[500px]">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Game Instructions Overlay */}
        {!gameOver && score === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 text-white flex items-center gap-4 animate-bounce">
              <ArrowLeftRight size={24} />
              <span className="font-black text-sm uppercase tracking-widest">Use Arrows to Move</span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-20 p-8">
            <div className="text-center space-y-8 max-w-sm animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-rose-100 rounded-[32px] flex items-center justify-center text-rose-600 mx-auto">
                <Trophy size={48} />
              </div>
              <div>
                <h2 className="text-5xl font-black text-white tracking-tighter">GAME OVER</h2>
                <p className="text-slate-400 font-bold mt-2">You hit the bureaucratic red tape!</p>
              </div>
              <div className="bg-white/10 rounded-3xl p-6 border border-white/10">
                <p className="text-slate-400 font-black text-xs uppercase mb-1">Final Leaves Collected</p>
                <p className="text-4xl font-black text-teal-400">{score}</p>
              </div>
              <button 
                onClick={resetGame}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 text-lg"
              >
                <RefreshCw size={24} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200">
          <p className="text-[10px] font-black text-rose-500 uppercase mb-2">The Enemy</p>
          <p className="text-sm font-bold text-slate-700">Avoid Red Blocks. They represent administrative delays.</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200">
          <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">The Goal</p>
          <p className="text-sm font-bold text-slate-700">Collect Green Spheres to increase your approval rating.</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200">
          <p className="text-[10px] font-black text-indigo-500 uppercase mb-2">Controls</p>
          <p className="text-sm font-bold text-slate-700">Arrow keys or A/D to switch lanes instantly.</p>
        </div>
      </div>
    </div>
  );
};

export default GameZone;
