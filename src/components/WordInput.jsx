import { useState, useRef, useEffect } from 'react';

/**
 * WordInput - Reusable word input component for the word chain game
 * 
 * @param {Function} onSubmit - Callback when word is submitted
 * @param {boolean} isSubmitting - Disable input during validation
 * @param {boolean} isValid - Show green glow feedback
 * @param {boolean} isInvalid - Show red shake feedback
 * @param {string} placeholder - Input placeholder text
 * @param {string} nextLetter - Letter the next word must start with (optional)
 * @param {string} lastWord - The last word played (optional)
 */
function WordInput({ 
  onSubmit, 
  isSubmitting = false, 
  isValid = false, 
  isInvalid = false,
  placeholder = "Type a brand name...",
  nextLetter = null,
  lastWord = null
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Auto-focus on desktop (not mobile to prevent keyboard popup)
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSubmitting) return;
    
    onSubmit(inputValue.trim());
    setInputValue(''); // Clear input after submit
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Dynamic classes for visual feedback
  const inputClasses = `
    w-full px-4 py-3 text-lg rounded-lg
    border-2 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isValid 
      ? 'border-green-500 ring-2 ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
      : isInvalid
        ? 'border-red-500 animate-shake'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-400'
    }
  `;

  const buttonClasses = `
    w-full sm:w-auto px-8 py-3 min-h-12
    text-white font-semibold rounded-lg
    transition-all duration-200
    touch-manipulation
    ${isSubmitting || !inputValue.trim()
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
    }
  `;

  return (
    <div className="word-input-container w-full">
      {/* Hint text showing required letter */}
      {nextLetter && (
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Next word must start with: <span className="font-bold text-blue-600">{nextLetter.toUpperCase()}</span>
          {lastWord && <span className="ml-2">(after "{lastWord}")</span>}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        {/* Input field */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSubmitting}
            className={inputClasses}
            aria-label="Enter a brand name"
            autoComplete="off"
            autoCapitalize="words"
            spellCheck="false"
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !inputValue.trim()}
          className={buttonClasses}
          aria-label="Submit word"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Checking...
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
}

export default WordInput;
