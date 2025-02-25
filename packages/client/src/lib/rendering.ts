import { getNetworkColor } from './networks';

export const fontSizeMatch = /(?<value>\d+\.?\d*)/;

export const setFontSize = (ctx: CanvasRenderingContext2D, size: number) =>
  (ctx.font = ctx.font.replace(fontSizeMatch, size.toString()));

export const nodeSize = 5;

export const renderNode = (
  node: any, 
  ctx: CanvasRenderingContext2D, 
  globalScale: number,
  nodeSize: number,
  logoMap: Map<string, HTMLImageElement> | null
) => {
  const label = node.name;
  const radius = node.val * nodeSize;

  const showNameGap = 3;
  const logoGap = 3;
  const logoPaddingX = 2;
  const logoPaddingY = 2;

  ctx.fillStyle =
    node.type === "show"
      ? node.networks && node.networks.length
        ? getNetworkColor(node.networks[0])
        : "#ff6b6b"
      : "#4ecdc4";

  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.stroke();

  if (node.type === "show" && node.networks && node.networks.length) {
    const network = node.networks[0];
    const logoImg = logoMap?.get(network.toLowerCase());

    if (logoImg && globalScale > 0.5) { // > 0.5 = optimisation, rendering images is more expensive
      const aspectRatio = logoImg.width / logoImg.height;

      let drawWidth, drawHeight;
      if (aspectRatio > 1) {
        drawWidth = radius * 1.4;
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawHeight = radius * 1.4;
        drawWidth = drawHeight * aspectRatio;
      }

      const drawX = node.x - drawWidth / 2;
      const drawY = node.y - radius - logoGap - drawHeight;

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillRect(
        drawX - logoPaddingX,
        drawY - logoPaddingY,
        drawWidth + logoPaddingX * 2,
        drawHeight + logoPaddingY * 2
      );
      ctx.drawImage(logoImg, drawX, drawY, drawWidth, drawHeight);
    } else {
      const drawX = node.x;
      const drawY = node.y - radius - logoGap;

      setFontSize(ctx, 8);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(network, drawX, drawY);
    }
  }

  if (node.type === "show") {
    const fontSize = Math.max(6, 25 - 10 * globalScale);
    setFontSize(ctx, fontSize);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(
      label,
      node.x,
      node.y + node.val * nodeSize + fontSize + showNameGap
    );
  }
};