import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

interface ProductSearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  onSearch,
  placeholder = "Buscar productos por nombre...",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-4 ${className}`}>
      <div className="flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Button type="submit">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </Button>

      {searchTerm && (
        <Button variant="secondary" type="button" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </form>
  );
};
