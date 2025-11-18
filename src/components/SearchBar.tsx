'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search tools, tags, or descriptions...",
  fullWidth = false
}: SearchBarProps) {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'max-w-2xl mx-auto'}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 h-11 bg-card"
      />
    </div>
  );
}
