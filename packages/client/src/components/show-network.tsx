import React, { useRef, useState } from "react";
import { useShowsData } from "@/lib/api";
import SearchForm from "@/components/search-form";
import Graph from "@/components/graph/graph";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const ShowNetwork: React.FC = () => {
  const { data: graphData, isLoading: isLoadingShows, error } = useShowsData();
  const [isGraphInitialized, setIsGraphInitialized] = useState(false);

  const graphRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Combined loading state (either API data loading or graph initializing)
  const isLoaderVisible = isLoadingShows || (graphData && !isGraphInitialized);

  // Loading text based on the current phase
  const loadingText = isLoadingShows
    ? "Loading show network data..."
    : "Loading graph...";

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end p-10 text-red-500 opacity-60">
        <p>Error loading data</p>
        <p>
          {error instanceof Error
            ? error.message
            : "Failed to load shows. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-50 flex flex-col justify-end opacity-50 p-10 transition-opacity duration-[600ms]",
          !isLoaderVisible && "opacity-0"
        )}
      >
        <p>{loadingText}</p>
      </div>

      {graphData && (
        <>
          {isGraphInitialized && (
            <div className="animate-fade-in">
              <SearchForm
                searchRef={searchRef}
                graphRef={graphRef}
                graphData={graphData}
              />
            </div>
          )}

          <Graph
            graphData={graphData}
            graphRef={graphRef}
            onInitialized={() => setIsGraphInitialized(true)}
          />
        </>
      )}
    </>
  );
};

export default ShowNetwork;
