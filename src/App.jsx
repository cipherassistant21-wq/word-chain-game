import { useState, useEffect } from 'react'
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
  const [isValidating, setIsValidating] = useState(false)
  const [validationSource, setValidationSource] = useState(null)
  const [fadeKey, setFadeKey] = useState(0)
  
  // Fade transition on turn change
  useEffect(() => {
    setFadeKey(prev => prev + 1)
  }, [currentPlayer])

  // Handle word submission
  const handleSubmit = async (word) => {
    if (!word.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    setIsValidating(true)
    setError(null)
    setSuggestion(null)
    setIsValid(false)
    setIsInvalid(false)
    setValidationSource(null)
    
    const result = await submitWord(word.trim())
    
    setIsValidating(false)
    
    if (result.success) {
      setIsValid(true)
      setInputWord('')
      setValidationSource(result.source || 'database')
      setTimeout(() => {
        setIsValid(false)
        setValidationSource(null)
      }, 1500)
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
    setValidationSource(null)
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
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🎮 Word Chain
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            Brand Name Challenge
          </p>
        </header>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
          {isGameOver ? (
            <div className="text-center animate-fadeIn">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Over!</h2>
              <ScoreBoard key={fadeKey} scores={scores} currentPlayer={currentPlayer} playerNames={{}} winner={winner} isGameOver={isGameOver} />
              <div className="text-white text-lg mb-4">
                <span className="font-bold">{winner === 1 ? 'Player 1' : 'Player 2'}</span> wins! 🏆
              </div>
              <button onClick={handlePlayAgain} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105">
                Play Again
              </button>
            </div>
          ) : (
            <>
              <ScoreBoard key={fadeKey} scores={scores} currentPlayer={currentPlayer} playerNames={{}} />
              
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white">
                  <span className="text-2xl">{currentPlayer === 1 ? '👤' : '👥'}</span>
                  <span className="font-semibold">Player {currentPlayer}'s Turn</span>
                </div>
              </div>

              {lastWord && (
                <div className="text-center mb-4">
                  <div className="text-white/70 text-sm mb-1">Last word:</div>
                  <div className="text-white text-xl font-bold mb-2">
                    {lastWord}
                    {validationSource && (
                      <span className="ml-2 text-sm opacity-70">
                        {validationSource === 'wikipedia' ? '🌐' : '✓'}
                      </span>
                    )}
                  </div>
                  <div className="text-amber-300 text-lg font-semibold animate-pulse">
                    Next word must start with: {nextLetter.toUpperCase()}
                  </div>
                </div>
              )}

              {isValidating && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-amber-300">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Validating with Wikipedia...
                  </div>
                </div>
              )}

              {validationSource && isValid && (
                <div className="text-center mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${validationSource === 'wikipedia' ? 'bg-blue-500/30 text-blue-200' : 'bg-green-500/30 text-green-200'}`}>
                    {validationSource === 'wikipedia' ? '🌐 Wikipedia' : '✓ Brand Database'}
                  </span>
                </div>
              )}

              <div className="mb-4 max-h-40 overflow-y-auto">
                <WordHistory words={words} />
              </div>

              {error && (
                <div className="mb-4 text-center">
                  <div className="text-red-300 text-sm">{error}</div>
                  {suggestion && (
                    <button onClick={handleSuggestionClick} className="mt-2 px-4 py-2 bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 rounded-lg text-sm transition-colors border border-amber-400/50">
                      Try: {suggestion} ✓
                    </button>
                  )}
                </div>
              )}

              <WordInput value={inputWord} onChange={setInputWord} onSubmit={handleSubmit} isValid={isValid} isInvalid={isInvalid} disabled={isSubmitting || isValidating} />

              <div className="mt-4 text-center">
                <button onClick={() => submitWord('')} className="text-white/50 hover:text-white/80 text-sm underline">
                  Skip turn (give up)
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => setShowRules(!showRules)} className="text-white/60 hover:text-white text-sm underline">
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
              <li>Unknown brands are validated via Wikipedia 🌐</li>
              <li>First player to fail loses!</li>
            </ul>
            <div className="mt-3 text-xs text-white/60">
              💡 Tip: If you misspell, we'll suggest the correct brand!
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-white/40 text-xs">
          Made with ❤️ | ~300 Indian + Global brands | Wikipedia API for unknowns
        </footer>
      </div>
    </div>
  )
}

export default App
