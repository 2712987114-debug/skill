import { useEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOutCubic = (value) => 1 - ((1 - value) ** 3);
const easeInOutCubic = (value) => (
  value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2
);

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export default function ParticleText({
  id,
  className = "",
  text,
  particleSize = 2,
  density = 4,
  color = "#ffffff",
  highlightColor = "#8b5cf6",
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = "hover",
  fontSize = "clamp(3rem, 12vw, 8rem)",
  fontWeight = 800,
  fontFamily = "inherit",
  align = "center",
  gradient = false,
  glow = false,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const context = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -1000, y: -1000, active: false };
    let particles = [];
    let frameId = 0;
    let resizeFrame = 0;
    let width = 0;
    let height = 0;
    let renderWidth = 0;
    let renderHeight = 0;
    let overscan = 0;
    let textStartX = 0;
    let textEndX = 1;
    let currentMode = "gather";
    let isVisible = false;

    const setCanvasSize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      overscan = Math.ceil(scatter + pointerRepel + 32);
      renderWidth = width + overscan * 2;
      renderHeight = height + overscan * 2;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(renderWidth * pixelRatio);
      canvas.height = Math.round(renderHeight * pixelRatio);
      canvas.style.width = `${renderWidth}px`;
      canvas.style.height = `${renderHeight}px`;
      canvas.style.left = `${-overscan}px`;
      canvas.style.top = `${-overscan}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const createParticles = () => {
      setCanvasSize();

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = width;
      sampleCanvas.height = height;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      const computedStyle = window.getComputedStyle(root);
      const resolvedFamily = fontFamily === "inherit" ? computedStyle.fontFamily : fontFamily;
      let resolvedSize = Number.parseFloat(computedStyle.fontSize) || 96;
      const lines = String(text).split("\n");
      const padding = Math.max(4, particleSize * 2);

      sampleContext.font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
      const widestLine = Math.max(...lines.map((line) => sampleContext.measureText(line).width));
      if (widestLine > width - padding * 2) {
        resolvedSize *= (width - padding * 2) / widestLine;
      }

      sampleContext.font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
      sampleContext.fillStyle = "#fff";
      sampleContext.textAlign = align;
      sampleContext.textBaseline = "middle";

      const lineHeight = resolvedSize * 1.06;
      const totalHeight = lines.length * lineHeight;
      const firstLineY = (height - totalHeight) / 2 + lineHeight / 2;
      const textX = align === "left" ? padding : align === "right" ? width - padding : width / 2;

      lines.forEach((line, index) => {
        sampleContext.fillText(line, textX, firstLineY + index * lineHeight);
      });

      const pixels = sampleContext.getImageData(0, 0, width, height).data;
      const nextParticles = [];
      const step = Math.max(2, Math.round(density));
      const now = performance.now();

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (pixels[(y * width + x) * 4 + 3] < 90) continue;

          const seed = x * 0.071 + y * 0.113;
          const angle = seededNoise(seed) * Math.PI * 2;
          const radius = scatter * (seededNoise(seed + 8.3) ** 1.55);
          const targetX = x + overscan;
          const targetY = y + overscan;
          const scatteredX = targetX + Math.cos(angle) * radius;
          const scatteredY = targetY + Math.sin(angle) * radius;

          const startsGathered = trigger === "hover";

          nextParticles.push({
            targetX,
            targetY,
            scatteredX,
            scatteredY,
            fromX: startsGathered ? targetX : scatteredX,
            fromY: startsGathered ? targetY : scatteredY,
            x: startsGathered ? targetX : scatteredX,
            y: startsGathered ? targetY : scatteredY,
            delay: seededNoise(seed + 16.7) * stagger,
            startTime: now,
            phase: seededNoise(seed + 31.4) * Math.PI * 2,
            floatRadius: 3 + seededNoise(seed + 42.1) * 10,
            floatSpeed: 0.00028 + seededNoise(seed + 53.8) * 0.00062,
          });
        }
      }

      particles = nextParticles;
      if (particles.length) {
        textStartX = Math.min(...particles.map((particle) => particle.targetX));
        textEndX = Math.max(...particles.map((particle) => particle.targetX));
      }
      currentMode = "gather";
    };

    const transitionTo = (mode) => {
      if (currentMode === mode || reduceMotion.matches) return;
      currentMode = mode;
      const now = performance.now();

      particles.forEach((particle) => {
        particle.fromX = particle.x;
        particle.fromY = particle.y;
        particle.startTime = now;
      });
    };

    const draw = (time) => {
      if (!isVisible) return;
      context.clearRect(0, 0, renderWidth, renderHeight);
      const duration = currentMode === "scatter"
        ? Math.min(680, gatherDuration * 0.48)
        : gatherDuration;

      context.beginPath();
      const highlighted = [];

      particles.forEach((particle) => {
        const destinationX = currentMode === "scatter" ? particle.scatteredX : particle.targetX;
        const destinationY = currentMode === "scatter" ? particle.scatteredY : particle.targetY;
        const delay = currentMode === "gather" ? particle.delay : particle.delay * 0.18;
        const progress = reduceMotion.matches
          ? 1
          : clamp((time - particle.startTime - delay) / duration, 0, 1);
        const eased = currentMode === "scatter" ? easeOutCubic(progress) : easeInOutCubic(progress);

        particle.x = particle.fromX + (destinationX - particle.fromX) * eased;
        particle.y = particle.fromY + (destinationY - particle.fromY) * eased;

        const scatteredMotion = currentMode === "scatter" ? easeOutCubic(progress) : 0;
        const ambientX = Math.sin(time * 0.0012 + particle.phase) * idleDrift;
        const ambientY = Math.cos(time * 0.001 + particle.phase) * idleDrift;
        const floatingX = Math.sin(time * particle.floatSpeed + particle.phase)
          * particle.floatRadius * scatteredMotion;
        const floatingY = Math.cos(time * particle.floatSpeed * 0.82 + particle.phase * 1.37)
          * particle.floatRadius * scatteredMotion;

        let drawX = reduceMotion.matches
          ? particle.targetX
          : particle.x + ambientX + floatingX;
        let drawY = reduceMotion.matches
          ? particle.targetY
          : particle.y + ambientY + floatingY;
        let influence = 0;

        if (pointer.active && !reduceMotion.matches) {
          const deltaX = drawX - pointer.x;
          const deltaY = drawY - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance < repelRadius) {
            influence = 1 - distance / repelRadius;
            const safeDistance = Math.max(distance, 0.01);
            drawX += (deltaX / safeDistance) * pointerRepel * influence;
            drawY += (deltaY / safeDistance) * pointerRepel * influence;
          }
        }

        if (influence > 0.08) {
          highlighted.push([drawX, drawY]);
        } else {
          context.rect(drawX, drawY, particleSize, particleSize);
        }
      });

      context.shadowBlur = 0;
      if (gradient) {
        const textGradient = context.createLinearGradient(textStartX, 0, textEndX, 0);
        textGradient.addColorStop(0, color);
        textGradient.addColorStop(0.46, "#e7ddff");
        textGradient.addColorStop(1, highlightColor);
        context.fillStyle = textGradient;
      } else {
        context.fillStyle = color;
      }
      context.fill();

      if (highlighted.length) {
        context.beginPath();
        highlighted.forEach(([x, y]) => context.rect(x, y, particleSize, particleSize));
        context.fillStyle = highlightColor;
        if (glow) {
          context.shadowColor = highlightColor;
          context.shadowBlur = 12;
        }
        context.fill();
        context.shadowBlur = 0;
      }

      if (isVisible && (!reduceMotion.matches || pointer.active)) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const rebuild = () => {
      window.cancelAnimationFrame(frameId);
      createParticles();
      frameId = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left + overscan;
      pointer.y = event.clientY - bounds.top + overscan;
      pointer.active = true;
    };
    const handlePointerEnter = (event) => {
      handlePointerMove(event);
      if (trigger === "hover") transitionTo("scatter");
    };
    const handlePointerLeave = () => {
      pointer.active = false;
      if (trigger === "hover") transitionTo("gather");
    };
    const handleMotionPreference = () => rebuild();

    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(rebuild);
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      window.cancelAnimationFrame(frameId);
      if (isVisible) frameId = window.requestAnimationFrame(draw);
    }, { rootMargin: "160px" });

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerenter", handlePointerEnter);
    root.addEventListener("pointerleave", handlePointerLeave);
    reduceMotion.addEventListener("change", handleMotionPreference);
    resizeObserver.observe(root);
    visibilityObserver.observe(root);

    document.fonts?.ready.then(rebuild);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
      reduceMotion.removeEventListener("change", handleMotionPreference);
    };
  }, [
    align,
    color,
    density,
    fontFamily,
    fontSize,
    fontWeight,
    gatherDuration,
    gradient,
    glow,
    highlightColor,
    idleDrift,
    particleSize,
    pointerRepel,
    repelRadius,
    scatter,
    stagger,
    text,
    trigger,
  ]);

  return (
    <div
      id={id}
      ref={rootRef}
      className={`particle-text ${className}`.trim()}
      style={{ fontSize, fontWeight, fontFamily }}
      role="img"
      aria-label={String(text).replaceAll("\n", " ")}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
