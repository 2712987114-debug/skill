import { useEffect, useMemo, useRef, useState } from "react";

function tokenize(text, animateBy) {
  const lines = String(text).split("\n");
  let animationIndex = 0;
  const tokens = [];

  lines.forEach((line, lineIndex) => {
    let segments;

    if (animateBy === "letters") {
      segments = Array.from(line);
    } else if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("zh-CN", { granularity: "word" });
      segments = Array.from(segmenter.segment(line), ({ segment }) => segment);
    } else {
      segments = line.split(/(\s+)/).filter(Boolean);
    }

    segments.forEach((segment) => {
      if (/^\s+$/.test(segment)) {
        tokens.push({ type: "space", content: segment });
        return;
      }

      tokens.push({
        type: "piece",
        content: segment,
        animationIndex,
      });
      animationIndex += 1;
    });

    if (lineIndex < lines.length - 1) tokens.push({ type: "break" });
  });

  return { tokens, pieceCount: animationIndex };
}

export default function BlurText({
  as: Component = "p",
  text,
  delay = 150,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  className = "",
  ...rest
}) {
  const rootRef = useRef(null);
  const completedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const { tokens, pieceCount } = useMemo(
    () => tokenize(text, animateBy),
    [animateBy, text],
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.16, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !onAnimationComplete || completedRef.current) return undefined;

    const completionDelay = Math.max(0, pieceCount - 1) * delay + 850;
    const timeout = window.setTimeout(() => {
      completedRef.current = true;
      onAnimationComplete();
    }, completionDelay);

    return () => window.clearTimeout(timeout);
  }, [delay, isVisible, onAnimationComplete, pieceCount]);

  return (
    <Component
      ref={rootRef}
      className={`blur-text ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{ "--blur-offset": direction === "top" ? "-20px" : "20px" }}
      aria-label={String(text).replaceAll("\n", " ")}
      {...rest}
    >
      <span aria-hidden="true">
        {tokens.map((token, index) => {
          if (token.type === "break") return <br key={`break-${index}`} />;
          if (token.type === "space") return token.content;

          return (
            <span
              className="blur-text__piece"
              style={{ "--blur-delay": `${token.animationIndex * delay}ms` }}
              key={`${token.content}-${index}`}
            >
              {token.content}
            </span>
          );
        })}
      </span>
    </Component>
  );
}
