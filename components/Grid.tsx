import React, { useMemo } from 'react';
import { Point, GameStatus } from '../types';

interface GridProps {
  size: number;
  snake: Point[];
  food: Point;
  status: GameStatus;
}

const Grid: React.FC<GridProps> = ({ size, snake, food, status }) => {
  // Check if a cell is part of the snake
  const getCellClass = (x: number, y: number) => {
    // Check head
    if (snake[0].x === x && snake[0].y === y) {
      return 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] z-10 scale-110 rounded-sm';
    }
    
    // Check body
    const isBody = snake.some((part, index) => index !== 0 && part.x === x && part.y === y);
    if (isBody) {
      return 'bg-green-600/80 rounded-sm border border-green-800/30';
    }

    // Check food
    if (food.x === x && food.y === y) {
      return 'bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] rounded-full scale-90';
    }

    return 'bg-slate-800/50 border border-slate-700/20';
  };

  // Generate grid cells once per size change
  const cells = useMemo(() => {
    const grid = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid.push({ x, y });
      }
    }
    return grid;
  }, [size]);

  return (
    <div 
      className="grid gap-[1px] bg-slate-900 p-1 rounded-lg border-2 border-slate-700 shadow-2xl relative overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        aspectRatio: '1/1',
        width: '100%',
        maxWidth: '500px'
      }}
    >
      {cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          className={`w-full h-full transition-all duration-100 ${getCellClass(cell.x, cell.y)}`}
        />
      ))}
      
      {/* Overlay for Game Over / Pause */}
      {(status === GameStatus.GAME_OVER || status === GameStatus.PAUSED || status === GameStatus.IDLE) && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 text-center p-4">
          {status === GameStatus.IDLE && (
            <div className="animate-bounce text-green-400 text-3xl md:text-5xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              PRESS START
            </div>
          )}
          {status === GameStatus.PAUSED && (
            <div className="text-yellow-400 text-4xl font-bold tracking-wider">
              PAUSED
            </div>
          )}
          {status === GameStatus.GAME_OVER && (
            <div className="text-red-500 text-5xl font-bold tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
              GAME OVER
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Grid;