import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-left flex items-center justify-between transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600 focus:outline-none focus:border-indigo-500'}
          ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-700/50 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900/50 rounded border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-700">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center text-gray-500">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600/20 text-indigo-300' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
