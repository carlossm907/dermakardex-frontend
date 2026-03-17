import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useState } from "react";

interface SalesReportProductSearchProps {
  onSearch: (term: string) => void;
  className?: string;
}

export const SalesReportProductSearch: React.FC<
  SalesReportProductSearchProps
> = ({ onSearch, className = "" }) => {
  const [term, setTerm] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={term}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" variant="secondary">
        <svg
          className="w-4 h-4"
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

      {term && (
        <Button type="button" variant="secondary" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </form>
  );
};
