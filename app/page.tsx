'use client'
import { useEffect, useRef, useState } from 'react';
import plane from '../public/plane.png'

interface Pipe {
  x: number;
  y: number;
  scored?: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load the plane image
    const planeImage = new Image();
    planeImage.src = '/plane.png'; // Ensure this matches the file path in your `public` directory

    // Game constants
    const gravity = 0.5;
    const planeJump = -10;
    const pipeWidth = 35;
    const pipeGap = 300;
    const planeSize = 60;

    let planeY = canvas.height / 2;
    let planeVelocity = 0;
    let pipes: Pipe[] = [{ x: canvas.width, y: getRandomPipeY() }];
    let score = 0;
    let isGameOver = false;

    // Utility to get random pipe position
    function getRandomPipeY(): number {
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
          isGameOver = true;
        }

        // Increment score
        if (pipe.x + pipeWidth < 50 && !pipe.scored) {
          score += 1;
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
  }, [running]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', display: 'block', margin: '0 auto' }}
      ></canvas>
      <button
        onClick={() => {
          setRunning(true);
          window.location.reload();
        }}
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Restart Game
      </button>
    </div>
  );
}
