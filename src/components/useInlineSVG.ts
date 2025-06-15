import React, { useEffect, useState } from "react";

/**
 * Loads an SVG from a URL and parses it into a React element tree.
 * Returns the root SVG element as JSX, or null if loading/failed.
 * Optionally allows a callback to manipulate the SVG DOM before conversion.
 */
export function useInlineSVG(url: string, manipulateSvgDom?: (svg: SVGSVGElement) => void) {
  const [svgElement, setSvgElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(url);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) throw new Error("No <svg> found");
        // --- Responsive SVG fix ---
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        if (!svg.hasAttribute("viewBox")) {
          // Try to infer from width/height
          const w = svg.getAttribute("width");
          const h = svg.getAttribute("height");
          if (w && h && !w.endsWith('%') && !h.endsWith('%')) {
            svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
          } else {
            svg.setAttribute("viewBox", "0 0 1000 800"); // fallback default
          }
        }
        if (manipulateSvgDom) manipulateSvgDom(svg);
        // Convert SVG DOM to React element
        function domToReact(node: Element): any {
          const children = Array.from(node.childNodes).map((child) =>
            child.nodeType === 1 ? domToReact(child as Element) : child.textContent
          );
          const props: any = {};
          for (const attr of Array.from(node.attributes)) {
            // Convert SVG attributes to React props (e.g., class -> className)
            if (attr.name === "class") {
              props.className = attr.value;
            } else if (attr.name === "style") {
              // Parse style string to object
              const styleObj: Record<string, string> = {};
              attr.value.split(";").forEach((pair) => {
                const [key, value] = pair.split(":");
                if (key && value) {
                  // Convert kebab-case to camelCase for React
                  const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                  styleObj[camelKey] = value.trim();
                }
              });
              props.style = styleObj;
            } else {
              props[attr.name] = attr.value;
            }
          }
          return React.createElement(
            node.tagName,
            props,
            ...children
          );
        }
        if (!cancelled) setSvgElement(domToReact(svg));
      } catch {
        if (!cancelled) setSvgElement(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [url, manipulateSvgDom]);

  return svgElement;
}
