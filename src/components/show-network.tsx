import React, { useEffect, useRef, useState } from "react";
import { GraphData } from "@/lib/types";
import { preloadNetworkLogos } from "@/lib/networks";
import { fetchShowsData } from "@/lib/api";
import SearchForm from "@/components/search-form";
import Graph from "@/components/graph";

const ShowNetwork: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);

  const graphRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  const [displayHeight, setDisplayHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setDisplayWidth(window.innerWidth);
      setDisplayHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const [logoMap, setLogoMap] = useState<Map<string, HTMLImageElement> | null>(
    null
  );

  // preload network logos
  useEffect(() => {
    const networksArray: string[] = [];

    // doing this like this for typescript's sake, filter & map has type errors for some reason
    for (const node of graphData.nodes) {
      if (node.type === "show" && node.networks && node.networks.length > 0) {
        networksArray.push(node.networks[0]);
      }
    }

    const uniqueNetworks = [...new Set(networksArray)];

    preloadNetworkLogos(uniqueNetworks).then((map) => setLogoMap(map));
  }, [graphData.nodes]);

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
        <Graph
          graphData={graphData}
          logoMap={logoMap}
          width={displayWidth}
          height={displayHeight}
          graphRef={graphRef}
        />
      )}
    </div>
  );
};

export default ShowNetwork;
