import { useState, useCallback } from 'react'
import { BRANDS } from '../data/brands.js'
import { isBrandValid, getLastLetter } from '../utils/gameLogic.js'

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
   * @returns {object} - { valid: boolean, error: string|null }
   */
  const validateWord = useCallback((word) => {
    return isBrandValid(word, BRANDS, lastWord)
  }, [lastWord])

  /**
   * Submit a word for the current player
   * @param {string} word - Word to submit
   * @returns {object} - { success: boolean, error: string|null }
   */
  const submitWord = useCallback((word) => {
    // Validate the word
    const validation = isBrandValid(word, BRANDS, lastWord)

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Add word to history
    const newWord = { player: currentPlayer, word: validation.brand }
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

    return { success: true, error: null }
  }, [currentPlayer, lastWord])

  /**
   * End the game and declare a winner
   * @param {number} losingPlayer - The player who failed to provide a valid word
   */
  const endGame = useCallback((losingPlayer) => {
    setIsGameOver(true)
    // The winner is the other player
    const winnerPlayer = losingPlayer === 1 ? 2 : 1
    setWinner(winnerPlayer)
  }, [])

  /**
   * Get the last letter of the last word (for UI hint)
   * @returns {string}
   */
  const getNextLetter = useCallback(() => {
    if (!lastWord) return ''
    return getLastLetter(lastWord)
  }, [lastWord])

  return {
    // State
    currentPlayer,
    words,
    scores,
    lastWord,
    isGameOver,
    winner,
    playerNames,

    // Actions
    startGame,
    submitWord,
    validateWord,
    endGame,
    getNextLetter,
    setPlayerNames
  }
}
