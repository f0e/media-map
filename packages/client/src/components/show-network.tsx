import React, { useEffect, useRef, useState } from "react";
import { GraphData } from "@/lib/types";
import { fetchShowsData } from "@/lib/api";
import SearchForm from "@/components/search-form";
import Graph from "@/components/graph";

const ShowNetwork: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  const graphRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchShowsData();
        setGraphData(data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-[#001]">
      <SearchForm
        searchRef={searchRef}
        graphRef={graphRef}
        graphData={graphData}
      />

      {loading ? (
        <div className="flex items-center justify-center h-screen text-white">
          Loading...
        </div>
      ) : (
        <Graph graphData={graphData} graphRef={graphRef} />
      )}
    </div>
  );
};

export default ShowNetwork;
