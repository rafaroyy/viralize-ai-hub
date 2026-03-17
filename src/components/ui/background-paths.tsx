"use client";

import { useEffect, useRef, memo } from "react";

const FloatingPaths = memo(function FloatingPaths({ position }: { position: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Use CSS animations instead of framer-motion to avoid ref warnings and reduce CPU usage
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Generate paths
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 18; i++) {
      const d = `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", String(0.5 + i * 0.03));
      path.setAttribute("stroke-opacity", String(0.1 + i * 0.03));
      path.setAttribute("fill", "none");
      path.style.animation = `bgpath ${20 + i * 1.5}s linear infinite`;
      fragment.appendChild(path);
    }
    // Clear and append
    while (svg.lastChild) svg.removeChild(svg.lastChild);
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = "Background Paths";
    svg.appendChild(title);
    svg.appendChild(fragment);
  }, [position]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        ref={svgRef}
        className="w-full h-full text-foreground"
        viewBox="0 0 696 316"
        fill="none"
      />
    </div>
  );
});

export function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
    </div>
  );
}
