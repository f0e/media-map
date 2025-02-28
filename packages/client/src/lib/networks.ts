import NETWORKS from "./networks.json";

export function preloadNetworkLogos(
  networks: string[]
): Promise<Map<string, HTMLImageElement>> {
  const logoMap = new Map<string, HTMLImageElement>();
  const promises: Promise<void>[] = [];

  for (const network of networks) {
    const normalizedNetwork = network.toLowerCase();

    if (normalizedNetwork in networks) {
      const img = new Image();

      const promise = new Promise<void>((resolve) => {
        img.onload = () => {
          logoMap.set(normalizedNetwork, img);
          resolve();
        };

        img.onerror = () => {
          resolve();
        };
      });

      promises.push(promise);
      img.src = NETWORKS[normalizedNetwork as keyof typeof NETWORKS].logo;
    }
  }

  return Promise.all(promises).then(() => logoMap);
}

export function getNetworkColor(network: string): string {
  const networkColors: Record<string, string> = {};

  const normalizedNetwork = network.toLowerCase();

  if (normalizedNetwork in networkColors) {
    return NETWORKS[normalizedNetwork as keyof typeof NETWORKS].color;
  }

  // console.log("no colour for", normalizedNetwork);

  return "#6e6e6e";
}
