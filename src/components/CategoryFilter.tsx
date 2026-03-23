"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selected === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>All</button>
      {categories.map((cat) => (
        <button key={cat} onClick={() => onSelect(cat === selected ? null : cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selected === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{cat}</button>
      ))}
    </div>
  );
}
