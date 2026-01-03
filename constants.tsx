
import React from 'react';
import { Briefcase, User, Users, Heart, Star } from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Record<Category, { color: string; icon: React.ReactNode; bg: string }> = {
  Work: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    icon: <Briefcase size={16} /> 
  },
  Personal: { 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    icon: <User size={16} /> 
  },
  Family: { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-100',
    icon: <Users size={16} /> 
  },
  Social: { 
    color: 'text-rose-600', 
    bg: 'bg-rose-100',
    icon: <Heart size={16} /> 
  },
  Important: { 
    color: 'text-amber-600', 
    bg: 'bg-amber-100',
    icon: <Star size={16} /> 
  },
};

export const MOCK_USERS = [
  { id: '1', name: 'Alex Rivera', avatar: 'https://picsum.photos/seed/alex/100' },
  { id: '2', name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/100' },
  { id: '3', name: 'Michael Scott', avatar: 'https://picsum.photos/seed/michael/100' },
];
