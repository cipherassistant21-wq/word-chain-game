import React, { useEffect, useRef, useState } from 'react';

/**
 * WordHistory Component
 * Displays a scrollable list of played words with player indicators
 * and highlight animations for new entries.
 * 
 * @param {Array} words - Array of {player: 1|2, word: string} objects
 */
function WordHistory({ words }) {
  const containerRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const prevWordsLengthRef = useRef(words.length);

  // Auto-scroll to bottom when new word is added
  useEffect(() => {
    if (words.length > prevWordsLengthRef.current) {
      // New word added - scroll to bottom
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Highlight the new word (last in array)
      setHighlightedIndex(words.length - 1);
      
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedIndex(-1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    prevWordsLengthRef.current = words.length;
  }, [words.length]);

  // Player color configurations
  const playerStyles = {
    1: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-300',
      highlight: 'bg-blue-100',
      badge: 'bg-blue-500'
    },
    2: {
      bg: 'bg-purple-500',
      text: 'text-purple-500',
      border: 'border-purple-300',
      highlight: 'bg-purple-100',
      badge: 'bg-purple-500'
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Word History</h3>
      
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
        {words.length === 0 ? (
          <p className="text-gray-400 text-center italic py-4">
            No words played yet. Start the game!
          </p>
        ) : (
          <div ref={containerRef} className="space-y-2">
            {words.map((entry, index) => {
              const player = entry.player;
              const isHighlighted = index === highlightedIndex;
              const style = playerStyles[player];
              
              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg
                    border transition-all duration-300 ease-in-out
                    ${isHighlighted 
                      ? `${style.highlight} ${style.border} scale-105 shadow-md` 
                      : 'bg-white border-transparent hover:bg-gray-100'
                    }
                  `}
                >
                  {/* Player Badge */}
                  <span className={`
                    px-2 py-1 rounded-full text-white text-xs font-bold min-w-[40px] text-center
                    ${style.badge}
                  `}>
                    P{player}
                  </span>
                  
                  {/* Word */}
                  <span className={`
                    font-medium flex-1
                    ${isHighlighted ? style.text : 'text-gray-700'}
                  `}>
                    {entry.word}
                  </span>
                  
                  {/* Score indicator (word length) */}
                  <span className="text-xs text-gray-400">
                    +{entry.word.length}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordHistory;
