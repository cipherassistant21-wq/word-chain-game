/**
 * StartScreen Component
 * Entry screen for the Word Chain game
 *
 * Props:
 * - onStartGame: function(playerNames) - called when Start button is clicked
 */
function StartScreen({ onStartGame }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const names = {
      1: formData.get('player1')?.toString().trim() || 'Player 1',
      2: formData.get('player2')?.toString().trim() || 'Player 2'
    }
    onStartGame(names)
  }

  return (
    <div className="animate-fadeIn">
      {/* Game Title */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Word Chain
        </h1>
        <p className="text-white/70 text-lg">
          Brand Battle Edition
        </p>
      </div>

      {/* Game Description */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
        <h2 className="text-white font-semibold mb-2 text-center">How to Play</h2>
        <ul className="text-white/70 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-300">🎯</span>
            <span>Take turns naming brands & products</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-300">🔗</span>
            <span>Each word must start with the last letter of the previous word</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-300">🏆</span>
            <span>Longer words = more points. Most points wins!</span>
          </li>
        </ul>
      </div>

      {/* Player Name Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Player 1 Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <label className="block text-blue-300 text-xs uppercase tracking-wider mb-2">
              Player 1
            </label>
            <input
              type="text"
              name="player1"
              maxLength={20}
              placeholder="Enter name..."
              className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-center font-semibold"
            />
          </div>

          {/* Player 2 Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <label className="block text-purple-300 text-xs uppercase tracking-wider mb-2">
              Player 2
            </label>
            <input
              type="text"
              name="player2"
              maxLength={20}
              placeholder="Enter name..."
              className="w-full px-4 py-3 bg-white/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-center font-semibold"
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/30 touch-manipulation animate-pulse"
        >
          🚀 Start Game
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-white/40 text-xs mt-6">
        2-Player Local Game
      </p>
    </div>
  )
}

export default StartScreen
