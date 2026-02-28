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
    getNextLetter,
    setPlayerNames,
    getCurrentPlayerName
  } = useGameState()
  
  const [inputWord, setInputWord] = useState('')
  const [error, setError] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
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
    setSuggestion(null)
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
      if (result.suggestion) {
        setSuggestion(result.suggestion)
      }
      setTimeout(() => setIsInvalid(false), 500)
    }
    
    setIsSubmitting(false)
  }

  // Handle suggestion click
  const handleSuggestionClick = () => {
    if (suggestion) {
      setInputWord(suggestion)
      setSuggestion(null)
      setError(null)
    }
  }

  const handlePlayAgain = () => {
    startGame()
    setInputWord('')
    setError(null)
    setSuggestion(null)
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
                key={fadeKey}
                scores={scores}
                currentPlayer={currentPlayer}
                playerNames={{}}
                winner={winner}
                isGameOver={isGameOver}
              />
              <div className="text-white text-lg mb-4">
                <span className="font-bold">
                  {winner === 1 ? 'Player 1' : 'Player 2'}
                </span>{' '}
                wins! 🏆
              </div>
              <button
                onClick={handlePlayAgain}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                           text-white font-bold rounded-xl shadow-lg hover:from-green-600 
                           hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          ) : (
            // Active Game
            <>
              {/* Score Board */}
              <ScoreBoard
                key={fadeKey}
                scores={scores}
                currentPlayer={currentPlayer}
                playerNames={{}}
              />

              {/* Turn Indicator */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 
                                bg-white/20 rounded-full text-white">
                  <span className="text-2xl">
                    {currentPlayer === 1 ? '👤' : '👥'}
                  </span>
                  <span className="font-semibold">
                    Player {currentPlayer}'s Turn
                  </span>
                </div>
              </div>

              {/* Last Word & Required Letter */}
              {lastWord && (
                <div className="text-center mb-4">
                  <div className="text-white/70 text-sm mb-1">Last word:</div>
                  <div className="text-white text-xl font-bold mb-2">
                    {lastWord}
                  </div>
                  <div className="text-amber-300 text-lg font-semibold animate-pulse">
                    Next word must start with: {nextLetter.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Word History */}
              <div className="mb-4 max-h-40 overflow-y-auto">
                <WordHistory words={words} />
              </div>

              {/* Error Message with Suggestion */}
              {error && (
                <div className="mb-4 text-center">
                  <div className="text-red-300 text-sm animate-shake">
                    {error}
                  </div>
                  {suggestion && (
                    <button
                      onClick={handleSuggestionClick}
                      className="mt-2 px-4 py-2 bg-amber-500/30 hover:bg-amber-500/50
                                 text-amber-200 rounded-lg text-sm transition-colors
                                 border border-amber-400/50"
                    >
                      Try: {suggestion} ✓
                    </button>
                  )}
                </div>
              )}

              {/* Word Input */}
              <WordInput
                value={inputWord}
                onChange={setInputWord}
                onSubmit={handleSubmit}
                isValid={isValid}
                isInvalid={isInvalid}
                disabled={isSubmitting}
              />

              {/* Skip Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => submitWord('')}
                  className="text-white/50 hover:text-white/80 text-sm underline"
                >
                  Skip turn (give up)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Rules */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowRules(!showRules)}
            className="text-white/60 hover:text-white text-sm underline"
          >
            {showRules ? 'Hide Rules' : 'How to Play?'}
          </button>
        </div>

        {showRules && (
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 text-white/90">
            <h3 className="font-bold mb-2">📜 Rules:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Two players take turns naming brands</li>
              <li>Each word must start with the last letter of the previous word</li>
              <li>Only advertised brands allowed (Nike, Amul, Tata, etc.)</li>
              <li>First player to fail loses!</li>
            </ul>
            <div className="mt-3 text-xs text-white/60">
              💡 Tip: If you misspell, we'll suggest the correct brand!
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-6 text-center text-white/40 text-xs">
          Made with ❤️ | ~300 Indian + Global brands
        </footer>
      </div>
    </div>
  )
}

export default App
