import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Direction, Point } from './types';
import Grid from './components/Grid';
import Controls from './components/Controls';
import { generateGameOverComment } from './services/geminiService';
import { Gamepad2, Trophy, Zap, MessageSquare } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_DECREMENT = 2;

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const getRandomFood = (snake: Point[]): Point => {
  let newFood: Point;
  let isOnSnake;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  } while (isOnSnake);
  return newFood;
};

const App: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Refs for mutable values inside the game loop to avoid dependency staleness
  const directionRef = useRef<Direction>(Direction.UP);
  const lastProcessedDirectionRef = useRef<Direction>(Direction.UP); // Prevent multiple moves in one tick

  // Initialize high score from local storage
  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
    setFood(getRandomFood(INITIAL_SNAKE));
  }, []);

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    lastProcessedDirectionRef.current = Direction.UP;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
    setFood(getRandomFood(INITIAL_SNAKE));
    setAiComment(null);
  };

  const gameOver = useCallback(async () => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
    
    // Trigger AI Comment
    setIsAiThinking(true);
    const comment = await generateGameOverComment(score, highScore);
    setAiComment(comment);
    setIsAiThinking(false);
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;

      switch (currentDir) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Check Wall Collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return prevSnake;
      }

      // Check Self Collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check Food Collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 1);
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_DECREMENT));
        setFood(getRandomFood(newSnake));
        // Don't pop the tail, so it grows
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [food, gameOver]);

  // Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [status, moveSnake, speed]);

  const handleDirectionChange = useCallback((newDir: Direction) => {
    // Prevent 180-degree turns on the current axis
    const current = lastProcessedDirectionRef.current;
    
    const isOpposite = 
      (newDir === Direction.UP && current === Direction.DOWN) ||
      (newDir === Direction.DOWN && current === Direction.UP) ||
      (newDir === Direction.LEFT && current === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && current === Direction.LEFT);

    if (!isOpposite) {
      setDirection(newDir);
    }
  }, []);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) {
        if (e.key === 'Enter' || e.key === ' ') {
          resetGame();
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        setStatus(prev => prev === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING);
      }

      if (status !== GameStatus.PLAYING) return;

      switch (e.key) {
        case 'ArrowUp': 
        case 'w':
        case 'W':
          handleDirectionChange(Direction.UP); 
          break;
        case 'ArrowDown': 
        case 's':
        case 'S':
          handleDirectionChange(Direction.DOWN); 
          break;
        case 'ArrowLeft': 
        case 'a':
        case 'A':
          handleDirectionChange(Direction.LEFT); 
          break;
        case 'ArrowRight': 
        case 'd':
        case 'D':
          handleDirectionChange(Direction.RIGHT); 
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleDirectionChange]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-200">
      
      {/* Header */}
      <header className="mb-6 text-center w-full max-w-md">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
          NEON SNAKE
        </h1>
        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm uppercase tracking-wider flex items-center gap-1">
              <Trophy size={14} /> High Score
            </span>
            <span className="text-2xl font-bold text-yellow-400">{highScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm uppercase tracking-wider flex items-center gap-1">
              <Zap size={14} /> Score
            </span>
            <span className="text-4xl font-bold text-white tabular-nums">{score}</span>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="w-full flex flex-col items-center">
        <Grid 
          size={GRID_SIZE} 
          snake={snake} 
          food={food} 
          status={status}
        />

        {/* AI Comment Section */}
        <div className="mt-6 w-full max-w-[500px] h-24 flex items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
          {isAiThinking ? (
            <div className="flex items-center gap-2 text-green-400 animate-pulse">
              <MessageSquare size={20} />
              <span className="text-lg">AI is analyzing your failure...</span>
            </div>
          ) : aiComment ? (
            <div className="flex gap-3 items-start w-full">
               <MessageSquare size={24} className="text-green-500 shrink-0 mt-1" />
               <p className="text-green-300 text-lg leading-tight font-medium typing-effect">
                 {aiComment}
               </p>
            </div>
          ) : (
            <div className="text-slate-600 text-sm flex items-center gap-2">
              <Gamepad2 size={16} />
              {status === GameStatus.PLAYING ? "Use Arrow Keys or Buttons to move" : "Press Enter or Start Button to play"}
            </div>
          )}
        </div>

        {/* Start Button / Controls */}
        {(status === GameStatus.IDLE || status === GameStatus.GAME_OVER) && (
          <button
            onClick={resetGame}
            className="mt-6 px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded-lg shadow-[0_0_20px_rgba(22,163,74,0.6)] border-b-4 border-green-800 active:scale-95 transition-all animate-pulse"
          >
            {status === GameStatus.IDLE ? 'START GAME' : 'RETRY'}
          </button>
        )}

        <Controls onDirectionChange={handleDirectionChange} />
        
        <div className="hidden md:block mt-8 text-slate-500 text-sm">
          Pro Tip: AI will roast you if you score less than 5.
        </div>
      </main>
    </div>
  );
};

export default App;