import { useState, useEffect } from 'react';

/**
 * ScoreBoard Component
 * Displays player scores with animations and visual feedback
 *
 * Props:
 * - scores: object {1: number, 2: number}
 * - currentPlayer: 1 or 2
 * - isGameOver: boolean
 * - winner: 1, 2, or null
 * - playerNames: object {1: 'Name', 2: 'Name'}
 */
function ScoreBoard({ scores, currentPlayer, isGameOver, winner, playerNames = { 1: 'Player 1', 2: 'Player 2' } }) {
  const [animateP1, setAnimateP1] = useState(false);
  const [animateP2, setAnimateP2] = useState(false);
  const [prevScore1, setPrevScore1] = useState(scores[1]);
  const [prevScore2, setPrevScore2] = useState(scores[2]);

  // Detect score changes and trigger animation
  useEffect(() => {
    if (scores[1] !== prevScore1) {
      setAnimateP1(true);
      setPrevScore1(scores[1]);
      const timer = setTimeout(() => setAnimateP1(false), 300);
      return () => clearTimeout(timer);
    }
  }, [scores[1], prevScore1]);

  useEffect(() => {
    if (scores[2] !== prevScore2) {
      setAnimateP2(true);
      setPrevScore2(scores[2]);
      const timer = setTimeout(() => setAnimateP2(false), 300);
      return () => clearTimeout(timer);
    }
  }, [scores[2], prevScore2]);

  // Confetti particles for winner celebration
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a'][Math.floor(Math.random() * 4)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );

  const isPlayer1Active = currentPlayer === 1 && !isGameOver;
  const isPlayer2Active = currentPlayer === 2 && !isGameOver;
  const player1Won = winner === 1;
  const player2Won = winner === 2;

  return (
    <div className="relative w-full max-w-md mx-auto px-4">
      {/* Main Score Container */}
      <div className="flex justify-between items-center gap-4">
        {/* Player 1 Score Box */}
        <div
          className={`
            relative flex-1 rounded-xl p-4 text-center
            transition-all duration-300 ease-out
            ${isPlayer1Active 
              ? 'bg-yellow-400/90 scale-105 shadow-lg shadow-yellow-400/30' 
              : 'bg-gray-700/50'}
            ${player1Won ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-xl shadow-yellow-400/50' : ''}
          `}
        >
          {/* Winner glow effect */}
          {player1Won && (
            <div className="absolute inset-0 rounded-xl bg-yellow-400/30 animate-pulse" />
          )}
          
          {/* Active player indicator */}
          {isPlayer1Active && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-md animate-bounce" />
          )}

          <h3 className={`
            text-sm font-medium mb-1
            ${isPlayer1Active ? 'text-gray-800' : 'text-gray-400'}
            ${player1Won ? 'text-gray-900 font-bold' : ''}
          `}>
            {playerNames[1]}
          </h3>
          
          <p className={`
            text-4xl font-bold tabular-nums
            transition-transform duration-150 ease-out
            ${animateP1 ? 'scale-125' : 'scale-100'}
            ${isPlayer1Active ? 'text-gray-900' : 'text-white'}
            ${player1Won ? 'text-5xl drop-shadow-lg' : ''}
          `}>
            {scores[1]}
          </p>

          {/* Winner badge */}
          {player1Won && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-300 text-xs font-bold text-gray-900 rounded-full shadow-md animate-pulse">
              🏆
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex-shrink-0">
          <span className={`
            text-2xl font-bold
            ${isGameOver ? 'text-gray-600' : 'text-gray-500'}
          `}>
            vs
          </span>
        </div>

        {/* Player 2 Score Box */}
        <div
          className={`
            relative flex-1 rounded-xl p-4 text-center
            transition-all duration-300 ease-out
            ${isPlayer2Active 
              ? 'bg-yellow-400/90 scale-105 shadow-lg shadow-yellow-400/30' 
              : 'bg-gray-700/50'}
            ${player2Won ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-xl shadow-yellow-400/50' : ''}
          `}
        >
          {/* Winner glow effect */}
          {player2Won && (
            <div className="absolute inset-0 rounded-xl bg-yellow-400/30 animate-pulse" />
          )}
          
          {/* Active player indicator */}
          {isPlayer2Active && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-md animate-bounce" />
          )}

          <h3 className={`
            text-sm font-medium mb-1
            ${isPlayer2Active ? 'text-gray-800' : 'text-gray-400'}
            ${player2Won ? 'text-gray-900 font-bold' : ''}
          `}>
            Player 2
          </h3>
          
          <p className={`
            text-4xl font-bold tabular-nums
            transition-transform duration-150 ease-out
            ${animateP2 ? 'scale-125' : 'scale-100'}
            ${isPlayer2Active ? 'text-gray-900' : 'text-white'}
            ${player2Won ? 'text-5xl drop-shadow-lg' : ''}
          `}>
            {scores[2]}
          </p>

          {/* Winner badge */}
          {player2Won && (
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-300 text-xs font-bold text-gray-900 rounded-full shadow-md animate-pulse">
              🏆
            </span>
          )}
        </div>
      </div>

      {/* Winner celebration overlay */}
      {isGameOver && winner && <Confetti />}

      {/* Game over message */}
      {isGameOver && winner && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-yellow-400 animate-pulse">
            Player {winner} Wins! 🎉
          </p>
        </div>
      )}

      {/* Draw message */}
      {isGameOver && !winner && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-gray-400">
            It's a Draw! 🤝
          </p>
        </div>
      )}
    </div>
  );
}

export default ScoreBoard;
