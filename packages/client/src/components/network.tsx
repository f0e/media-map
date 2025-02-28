import type React from "react";
import { useRef, useState } from "react";
import SearchForm from "@/components/search-form";
import Graph from "@/components/graph/graph";
import { cn } from "@/lib/utils";
import { useMediaData, useShowsData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MIN_ZOOM } from "./graph/constants";
import { MediaType } from "@/lib/types";

const Network: React.FC = () => {
  const [activeMediaType, setActiveMediaType] = useState<MediaType>("shows");

  const { data: graphData, isLoading, error } = useMediaData(activeMediaType);

  const [isGraphInitialized, setIsGraphInitialized] = useState(false);

  const graphRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Combined loading state (either API data loading or graph initialising)
  const isLoaderVisible = isLoading || (graphData && !isGraphInitialized);

  // Loading text based on the current phase and media type
  const loadingText = isLoading
    ? `Loading ${activeMediaType} data...`
    : "Initialising visualization...";

  const handleMediaTypeChange = (type: MediaType) => {
    setActiveMediaType(type);
    setIsGraphInitialized(false);

    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, MIN_ZOOM, 500);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end p-10 text-red-500 opacity-60">
        <p>Error loading data</p>
        <p>
          {error instanceof Error
            ? error.message
            : `Failed to load ${activeMediaType}. Please try again later.`}
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

      <div className="fixed p-4 z-40">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {(["shows", "movies", "music"] as MediaType[]).map((type) => (
              <Button
                variant="custom"
                key={type}
                onClick={() => handleMediaTypeChange(type)}
                className={cn(
                  activeMediaType === type &&
                    "bg-primary text-primary-foreground"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {!error && (
            <SearchForm
              searchRef={searchRef}
              graphRef={graphRef}
              graphData={graphData}
            />
          )}
        </div>
      </div>

      {graphData && (
        <Graph
          graphData={graphData}
          graphRef={graphRef}
          mediaType={activeMediaType}
          onInitialized={() => setIsGraphInitialized(true)}
        />
      )}
    </>
  );
};

export default Network;
