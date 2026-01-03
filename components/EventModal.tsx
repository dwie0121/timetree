
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, MapPin, AlignLeft, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { CalendarEvent, Category } from '../types';
import { CATEGORIES } from '../constants';
import { parseEventFromNaturalLanguage } from '../services/geminiService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdBy' | 'attendees'>) => void;
  initialDate?: string;
  editEvent?: CalendarEvent | null;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, initialDate, editEvent }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<Category>('Personal');
  const [description, setDescription] = useState('');
  const [isMagicParsing, setIsMagicParsing] = useState(false);
  const [magicInput, setMagicInput] = useState('');

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setDate(editEvent.date);
      setStartTime(editEvent.startTime || '09:00');
      setEndTime(editEvent.endTime || '10:00');
      setCategory(editEvent.category);
      setDescription(editEvent.description || '');
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('Personal');
      setDescription('');
    }
  }, [editEvent, initialDate, isOpen]);

  const handleMagicParse = async () => {
    if (!magicInput.trim()) return;
    setIsMagicParsing(true);
    const parsed = await parseEventFromNaturalLanguage(magicInput);
    if (parsed) {
      setTitle(parsed.title);
      setDate(parsed.date);
      if (parsed.startTime) setStartTime(parsed.startTime);
      if (parsed.endTime) setEndTime(parsed.endTime);
      if (parsed.category) setCategory(parsed.category as Category);
      if (parsed.description) setDescription(parsed.description);
      setMagicInput('');
    }
    setIsMagicParsing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">{editEvent ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Input Section */}
          {!editEvent && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
              <label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Sparkles size={14} /> Magic Create
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Lunch with Sarah next Friday at 1pm"
                  value={magicInput}
                  onChange={(e) => setMagicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMagicParse()}
                  className="flex-1 bg-white border-blue-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl px-4 py-2 text-sm text-gray-700 outline-none transition-all border"
                />
                <button 
                  onClick={handleMagicParse}
                  disabled={isMagicParsing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  {isMagicParsing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <input 
              type="text" 
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder:text-gray-300 outline-none"
            />
          </div>

          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex-1">
                <CalendarIcon size={18} className="text-gray-400" />
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <Clock size={18} className="text-gray-400" />
                <input 
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm outline-none w-20"
                />
                <span className="text-gray-300">-</span>
                <input 
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm outline-none w-20"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                      category === cat 
                        ? `${CATEGORIES[cat].bg} ${CATEGORIES[cat].color} border-transparent shadow-sm scale-105` 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {CATEGORIES[cat].icon}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex gap-3 items-start">
              <AlignLeft size={20} className="text-gray-400 mt-2 shrink-0" />
              <textarea 
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border-gray-100 focus:ring-blue-500 focus:border-blue-500 rounded-xl p-3 text-sm text-gray-700 outline-none transition-all border min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/80 flex items-center justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-all font-medium text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave({ title, date, startTime, endTime, category, description })}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 font-bold text-sm active:scale-95"
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
