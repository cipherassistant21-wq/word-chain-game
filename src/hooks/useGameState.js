import { useState, useCallback } from 'react'
import { BRANDS } from '../data/brands.js'
import { isBrandValid, isBrandValidAsync, getLastLetter } from '../utils/gameLogic.js'

/**
 * Custom hook for managing Word Chain game state
 * Handles turns, word validation, scoring, and game flow
 */
export function useGameState() {
  // Current player (1 or 2)
  const [currentPlayer, setCurrentPlayer] = useState(1)

  // Player names
  const [playerNames, setPlayerNames] = useState({ 1: 'Player 1', 2: 'Player 2' })

  // History of all played words: [{player, word}, ...]
  const [words, setWords] = useState([])

  // Scores for each player
  const [scores, setScores] = useState({ 1: 0, 2: 0 })

  // The last word played (for chain validation)
  const [lastWord, setLastWord] = useState('')

  // Game over state
  const [isGameOver, setIsGameOver] = useState(false)

  // Winner player number (null if no winner)
  const [winner, setWinner] = useState(null)

  /**
   * Reset game state for a new game
   * @param {object} names - Optional {1: 'Name', 2: 'Name'} object
   */
  const startGame = useCallback((names = null) => {
    setCurrentPlayer(1)
    setWords([])
    setScores({ 1: 0, 2: 0 })
    setLastWord('')
    setIsGameOver(false)
    setWinner(null)
    if (names) {
      setPlayerNames(names)
    }
  }, [])

  /**
   * Validate a word without submitting it
   * @param {string} word - Word to validate
   * @returns {object} - { valid: boolean, error: string|null, suggestion: string|null }
   */
  const validateWord = useCallback((word) => {
    return isBrandValid(word, BRANDS, lastWord)
  }, [lastWord])

  /**
   * Submit a word for the current player
   * @param {string} word - Word to submit
   * @returns {Promise<{ success: boolean, error: string|null, suggestion: string|null, source?: 'database'|'wikipedia' }>}
   */
  const submitWord = useCallback(async (word) => {
    // Validate the word (async - checks database first, then Wikipedia)
    const validation = await isBrandValidAsync(word, BRANDS, lastWord)

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        suggestion: validation.suggestion || null,
        source: validation.source
      }
    }

    // Add word to history with source
    const newWord = { player: currentPlayer, word: validation.brand, source: validation.source }
    setWords(prev => [...prev, newWord])

    // Update last word
    setLastWord(validation.brand)

    // Update score (longer words = more points)
    const points = word.length
    setScores(prev => ({
      ...prev,
      [currentPlayer]: prev[currentPlayer] + points
    }))

    // Switch player
    setCurrentPlayer(prev => prev === 1 ? 2 : 1)

    return { success: true, error: null, suggestion: null, source: validation.source }
  }, [currentPlayer, lastWord])

  /**
   * Get the required starting letter for the next word
   * @returns {string} - The letter (lowercase) or empty string for first turn
   */
  const getNextLetter = useCallback(() => {
    if (!lastWord) return ''
    return getLastLetter(lastWord)
  }, [lastWord])

  /**
   * End the game (call when a player fails)
   */
  const endGame = useCallback(() => {
    setIsGameOver(true)
    // Current player failed, so the OTHER player wins
    setWinner(currentPlayer === 1 ? 2 : 1)
  }, [currentPlayer])

  /**
   * Skip turn (forfeit)
   */
  const skipTurn = useCallback(() => {
    endGame()
  }, [endGame])

  /**
   * Get current player name
   */
  const getCurrentPlayerName = useCallback(() => {
    return playerNames[currentPlayer] || `Player ${currentPlayer}`
  }, [currentPlayer, playerNames])

  return {
    // State
    currentPlayer,
    playerNames,
    words,
    scores,
    lastWord,
    isGameOver,
    winner,
    
    // Actions
    startGame,
    submitWord,
    validateWord,
    getNextLetter,
    endGame,
    skipTurn,
    setPlayerNames,
    getCurrentPlayerName
  }
}

export default useGameState
