'use client'
import { useEffect, useRef, useState } from 'react';

interface Pipe {
  x: number;
  y: number;
  scored?: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0); // Track the score

  // Create an audio object for the "boom" sound only on the client side
  let boomSound: HTMLAudioElement | undefined;
  if (typeof window !== 'undefined') {
    boomSound = new Audio('/Voicy_allah akbar.mp3'); // Path to your sound file
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Add null check for canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the plane image
    const planeImage = new Image();
    planeImage.src = '/plane.png'; // Image path relative to public directory

    // Game constants
    const gravity = 0.5;
    const planeJump = -10;
    const pipeWidth = 45;
    const pipeGap = 300;
    const planeSize = 80; // Increased plane size

    const pipes: Pipe[] = [{ x: canvas.width, y: getRandomPipeY() }];
    let planeY = canvas.height / 2;
    let planeVelocity = 0;
    let isGameOver = false;

    // Utility to get random pipe position
    function getRandomPipeY(): number {
      if (!canvas) return 0; // Ensure canvas is not null
      return Math.random() * (canvas.height - pipeGap - 50) + 25;
    }

    // Event listener for jump
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === 'Space' && !isGameOver) {
        planeVelocity = planeJump;
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    // Game loop
    function gameLoop() {
      if (!running) return;

      const canvas = canvasRef.current;
      if (!canvas) return; // Null check for canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // Null check for ctx

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw plane
      planeVelocity += gravity;
      planeY += planeVelocity;

      ctx.drawImage(planeImage, 50, planeY, planeSize, planeSize);

      // Draw pipes
      pipes.forEach((pipe) => {
        pipe.x -= 3;
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y); // Top pipe
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height); // Bottom pipe

        // Check collision
        if (
          50 < pipe.x + pipeWidth &&
          50 + planeSize > pipe.x &&
          (planeY < pipe.y || planeY + planeSize > pipe.y + pipeGap)
        ) {
          // Play the "boom" sound on collision
          boomSound?.play();
          isGameOver = true;
        }

        // Increment score
        if (pipe.x + pipeWidth < 50 && !pipe.scored) {
          setScore((prevScore) => prevScore + 1); // Update score using setScore
          pipe.scored = true;
        }
      });

      // Remove pipes that are off-screen
      if (pipes[0].x + pipeWidth < 0) {
        pipes.shift();
      }

      // Add new pipe
      if (pipes[pipes.length - 1].x < canvas.width - 200) {
        pipes.push({ x: canvas.width, y: getRandomPipeY() });
      }

      // Check for game over
      if (planeY + planeSize > canvas.height || planeY < 0) {
        // Play the "boom" sound if the plane hits the ground or goes off-screen
        boomSound?.play();
        isGameOver = true;
      }

      // Draw score
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 70, canvas.height / 2);
        setRunning(false);
      } else {
        requestAnimationFrame(gameLoop);
      }
    }

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [running, score]); // Add score to dependencies

  return (
    <div className="bg-gradient-to-b from-sky-300 to-blue-100 p-5 min-h-screen flex flex-col items-center justify-center">
      <h1 className="font-sans text-3xl text-gray-800 mb-5 shadow-text">
        911 DARK ADRIAN GAME
      </h1>
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 rounded"
        ></canvas>
      </div>
      <button
        onClick={() => {
          setRunning(true);
          setScore(0); // Reset score
          // Reset other necessary state variables
        }}
        className="mt-5 px-5 py-2 text-lg bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Restart Game
      </button>
    </div>
  );
}
