import type React from "react";
import type { FormEvent, RefObject } from "react";
import { Input } from "@/components/ui/input";
import type { GraphData } from "@/lib/types";
import { performSearch } from "@/lib/search";
import { ModeToggle } from "./mode-toggle";

interface SearchFormProps {
  searchRef: RefObject<HTMLInputElement | null>;
  graphRef: RefObject<HTMLElement | null>;
  graphData: GraphData;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchRef,
  graphRef,
  graphData,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!graphRef.current) return;

    const query = searchRef.current?.value;
    if (!query) return;

    performSearch(query, graphData, graphRef.current);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      {/* <ModeToggle /> */}
      <Input ref={searchRef} placeholder="Search" />
    </form>
  );
};

export default SearchForm;
