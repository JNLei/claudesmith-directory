'use client';

import { Button } from '@/components/ui/button';
import { ToolCategory } from '@/lib/types';

interface CategoryFilterProps {
  selected: ToolCategory | 'all';
  onSelect: (category: ToolCategory | 'all') => void;
}

const categories: Array<{ id: ToolCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'skills', label: 'Skills' },
  { id: 'agents', label: 'Agents' },
  { id: 'slash-commands', label: 'Commands' },
  { id: 'mcp', label: 'MCP' },
  { id: 'plugin', label: 'Plugin' },
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <Button
            key={category.id}
            onClick={() => onSelect(category.id)}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className="font-medium"
          >
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}
