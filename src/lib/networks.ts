import NetworkLogos from "./networkLogos.json";

export function preloadNetworkLogos(
  networks: string[]
): Promise<Map<string, HTMLImageElement>> {
  const logoMap = new Map<string, HTMLImageElement>();
  const promises: Promise<void>[] = [];

  for (const network of networks) {
    const normalizedNetwork = network.toLowerCase();

    if (normalizedNetwork in NetworkLogos) {
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
      img.src = NetworkLogos[normalizedNetwork as keyof typeof NetworkLogos];
    }
  }

  return Promise.all(promises).then(() => logoMap);
}

export function getNetworkColor(network: string): string {
  const networkColors: Record<string, string> = {
    netflix: "#E50914",
    hulu: "#1CE783",
    amazon: "#00A8E1",
    "disney+": "#113CCF",
    "apple tv+": "#000000",
    "hbo max": "#5822B4",
    "paramount+": "#0064FF",
    peacock: "#000F9F",
    amc: "#BE0E1D",
    nbc: "#FFF100",
    abc: "#000000",
    cbs: "#0052A5",
    fox: "#005AFF",
    cw: "#00A388",
    bbc: "#BB1919",
    itv: "#103D91",
    "channel 4": "#503E96",
    fx: "#000000",
    tbs: "#00A0E2",
    showtime: "#B20000",
    starz: "#016577",
    syfy: "#4158DD",
    history: "#0072CE",
    discovery: "#0898D4",
    pbs: "#2638C4",
    mtv: "#000000",
    "bbc one": "#BB1919",
    "las estrellas": "#00AEEF",
    "the wb": "#1B75BB",
    hbo: "#000000",
    "usa network": "#0033A0",
    nickelodeon: "#FF6600",
    upn: "#6F2C91",
    syndication: "#808080",
    "cartoon network": "#00AEEF",
    "the cw": "#00A388",
    "bbc two": "#0068B3",
    "network ten": "#00AEEF",
    tnt: "#E42313",
    "nine network": "#136CB2",
    itv1: "#103D91",
    "comedy central": "#040404",
    "antena 3": "#FF7328",
    nicktoons: "#78BC3F",
    telefe: "#2BACE2",
    e4: "#6A068B",
    "azul televisión": "#0066CC",
    univision: "#01A9DB",
    "fuji tv": "#0054A6",
    rcn: "#FDDA24",
    kbs2: "#1428A0",
    "abc family": "#00A0E6",
    dr1: "#D91900",
    "prime video": "#0779FF",
  };

  const normalizedNetwork = network.toLowerCase();

  if (normalizedNetwork in networkColors) {
    return networkColors[normalizedNetwork];
  }

  // console.log("no colour for", normalizedNetwork);

  return "#6e6e6e";
}