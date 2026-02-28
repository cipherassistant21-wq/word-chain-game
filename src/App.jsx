import { useState, useEffect, useRef } from 'react'
import { useGameState } from './hooks/useGameState.js'
import WordInput from './components/WordInput.jsx'
import ScoreBoard from './components/ScoreBoard.jsx'
import WordHistory from './components/WordHistory.jsx'

function App() {
  const {
    currentPlayer,
    words,
    scores,
    lastWord,
    isGameOver,
    winner,
    startGame,
    submitWord,
    getNextLetter
  } = useGameState()
  
  const [inputWord, setInputWord] = useState('')
  const [error, setError] = useState(null)
  const [showRules, setShowRules] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  
  // Fade transition on turn change
  useEffect(() => {
    setFadeKey(prev => prev + 1)
  }, [currentPlayer])

  // Handle word submission
  const handleSubmit = (word) => {
    if (!word.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    setIsValid(false)
    setIsInvalid(false)
    
    const result = submitWord(word.trim())
    
    if (result.success) {
      setIsValid(true)
      setInputWord('')
      setTimeout(() => setIsValid(false), 500)
    } else {
      setIsInvalid(true)
      setError(result.error)
      setTimeout(() => setIsInvalid(false), 500)
    }
    
    setIsSubmitting(false)
  }

  const handlePlayAgain = () => {
    startGame()
    setInputWord('')
    setError(null)
    setIsValid(false)
    setIsInvalid(false)
  }

  const nextLetter = getNextLetter()

  // Keyboard shortcut for rules toggle
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?' && !isGameOver) {
        setShowRules(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isGameOver])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎮 Word Chain
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            Brand Name Challenge
          </p>
        </header>

        {/* Main Game Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
          {isGameOver ? (
            // Game Over Screen
            <div className="text-center animate-fadeIn">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Game Over!
              </h2>
              <ScoreBoard 
                scores={scores}
                currentPlayer={currentPlayer}
                isGameOver={isGameOver}
                winner={winner}
              />
              <div className="mt-6">
                <p className="text-white/60 text-sm mb-4">
                  Total words: {words.length}
                </p>
                <button
                  onClick={handlePlayAgain}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation"
                >
                  🔄 Play Again
                </button>
              </div>
            </div>
          ) : (
            // Active Game Screen
            <div key={fadeKey} className="animate-fadeIn">
              {/* Score Board */}
              <ScoreBoard 
                scores={scores}
                currentPlayer={currentPlayer}
                isGameOver={isGameOver}
                winner={winner}
              />

              {/* Turn Indicator */}
              <div className="text-center my-4 py-3 bg-white/5 rounded-xl">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  Current Turn
                </p>
                <p className={`
                  text-2xl font-bold transition-all duration-300
                  ${currentPlayer === 1 ? 'text-blue-300' : 'text-purple-300'}
                `}>
                  Player {currentPlayer}
                </p>
              </div>

              {/* Last Word Hint */}
              {lastWord && (
                <div className="text-center mb-4 animate-slideDown">
                  <p className="text-white/50 text-xs">Last Word</p>
                  <p className="text-xl font-bold text-white drop-shadow">
                    {lastWord.toUpperCase()}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Next: <span className="text-yellow-300 font-bold text-lg">{nextLetter?.toUpperCase()}</span>
                  </p>
                </div>
              )}

              {/* Word Input */}
              <div className="mt-4">
                <WordInput
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isValid={isValid}
                  isInvalid={isInvalid}
                  placeholder={lastWord ? `Brand starting with "${nextLetter?.toUpperCase()}"` : "Type a brand name..."}
                  nextLetter={nextLetter}
                  lastWord={lastWord}
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-300 text-sm text-center mt-2 animate-shake">
                  ⚠️ {error}
                </p>
              )}

              {/* Word History */}
              <div className="mt-6">
                <WordHistory words={words} />
              </div>

              {/* Give Up Button */}
              <button
                onClick={() => startGame()}
                className="w-full mt-4 py-2 px-4 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors text-sm touch-manipulation"
              >
                Give Up 😢
              </button>
            </div>
          )}
        </div>

        {/* Rules Toggle */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowRules(!showRules)}
            className="text-white/50 hover:text-white transition-colors text-sm underline underline-offset-2 touch-manipulation"
          >
            {showRules ? 'Hide Rules' : 'Show Rules (press ?)'}
          </button>
          
          {showRules && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-3 text-white/80 text-sm animate-slideDown">
              <h3 className="font-bold mb-2">📜 Rules</h3>
              <ul className="text-left space-y-1">
                <li>• Enter brand or advertised product names</li>
                <li>• Each word must start with the last letter of the previous word</li>
                <li>• First word can start with any letter</li>
                <li>• Points = word length (longer = better)</li>
                <li>• Can't think of one? Give up and lose!</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-white/30 text-xs">
          <p>2-Player Local Game</p>
        </footer>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}

export default App
