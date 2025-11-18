import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);
  
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="relative">
      <div className={`flex items-end bg-white rounded-3xl border-2 transition-all duration-200 ${
        isFocused 
          ? 'border-blue-400 shadow-lg shadow-blue-100' 
          : 'border-gray-200 shadow-md'
      } ${disabled ? 'opacity-50' : ''}`}>
        
        {/* Attachment Button */}
        <button
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-l-3xl"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        {/* Text Input */}
        <div className="flex-1 px-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full py-3 bg-transparent border-none outline-none resize-none placeholder-gray-400 text-gray-800 max-h-[120px] min-h-[24px]"
            style={{ lineHeight: '24px' }}
          />
        </div>
        
        {/* Voice Button */}
        <button
          className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={disabled}
        >
          <Mic className="w-5 h-5" />
        </button>
        
        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`m-1 p-2.5 rounded-full transition-all duration-200 ${
            message.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      {/* Helper Text */}
      <div className="mt-2 px-4">
        <p className="text-xs text-gray-500 text-center">
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> 전송 • 
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">Shift + Enter</kbd> 줄바꿈
        </p>
      </div>
    </div>
  );
};