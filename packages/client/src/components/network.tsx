import Graph from "@/components/graph/graph";
import SearchForm from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { useMediaData } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MediaType } from "@music-map/shared";
import { Link, useRouter } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface NetworkProps {
	mediaType: MediaType;
}

const Network: React.FC<NetworkProps> = ({ mediaType }) => {
	const [isGraphInitialized, setIsGraphInitialized] = useState(false);
	const router = useRouter();

	const { data: graphData, isLoading, error } = useMediaData(mediaType) as any; // todo: type properly

	const graphRef = useRef<HTMLElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	// Reset graph when media type changes
	useEffect(() => {
		setIsGraphInitialized(false);

		// if (graphRef.current) {
		//   graphRef.current.centerAt(0, 0, MIN_ZOOM, 500);
		// }
	}, [mediaType]);

	// Combined loading state (either API data loading or graph initialising)
	const isLoaderVisible = isLoading || (graphData && !isGraphInitialized);

	// Loading text based on the current phase and media type
	const loadingText = isLoading
		? `Loading ${mediaType} data...`
		: "Initialising visualization...";

	if (error) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col justify-end p-10 text-red-500 opacity-60">
				<p>Error loading data</p>
				<p>
					{error instanceof Error
						? error.message
						: `Failed to load ${mediaType}. Please try again later.`}
				</p>
			</div>
		);
	}

	return (
		<>
			<div
				className={cn(
					"pointer-events-none fixed inset-0 z-50 flex flex-col justify-end opacity-50 p-10 transition-opacity duration-[600ms]",
					!isLoaderVisible && "opacity-0",
				)}
			>
				<p>{loadingText}</p>
			</div>

			<div className="fixed p-4 z-40">
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						{(["shows", "movies", "music/artists"] as MediaType[]).map(
							(type) => (
								<Button
									variant="custom"
									key={type}
									asChild
									className={cn(
										router.state.location.pathname === `/${type}` &&
											"bg-primary text-primary-foreground",
									)}
								>
									<Link to={`/${type}`}>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</Link>
								</Button>
							),
						)}
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
					mediaType={mediaType}
					onInitialized={() => setIsGraphInitialized(true)}
				/>
			)}
		</>
	);
};

export default Network;
