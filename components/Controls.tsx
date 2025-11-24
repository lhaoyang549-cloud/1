import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface ControlsProps {
  onDirectionChange: (dir: Direction) => void;
}

const Controls: React.FC<ControlsProps> = ({ onDirectionChange }) => {
  const btnClass = "bg-slate-800 active:bg-slate-700 active:scale-95 transition-transform p-4 rounded-xl border-b-4 border-slate-950 shadow-lg text-green-400 touch-manipulation";

  return (
    <div className="grid grid-cols-3 gap-2 w-48 mt-6 select-none md:hidden">
      <div className="col-start-2">
        <button 
          className={`w-full ${btnClass}`}
          onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.UP); }}
          aria-label="Up"
        >
          <ArrowUp size={24} />
        </button>
      </div>
      <div className="col-start-1 row-start-2">
        <button 
          className={`w-full ${btnClass}`}
          onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.LEFT); }}
          aria-label="Left"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      <div className="col-start-2 row-start-2">
        <button 
          className={`w-full ${btnClass}`}
          onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.DOWN); }}
          aria-label="Down"
        >
          <ArrowDown size={24} />
        </button>
      </div>
      <div className="col-start-3 row-start-2">
        <button 
          className={`w-full ${btnClass}`}
          onPointerDown={(e) => { e.preventDefault(); onDirectionChange(Direction.RIGHT); }}
          aria-label="Right"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Controls;