import React from "react";
import { useInlineSVG } from "./useInlineSVG";

interface MapSVGProps {
  continentName: string;
  guessedCountries: string[];
}

const CONTINENT_SVG_MAP: Record<string, string> = {
  "Europe": "europe.svg",
  "Africa": "africa.svg",
  "Asia": "asia.svg",
  "North America": "north-america.svg",
  "South America": "south-america.svg",
  "Oceania": "oceania.svg",
};

export default function MapSVG({ continentName, guessedCountries }: MapSVGProps) {
  const fileName = CONTINENT_SVG_MAP[continentName];
  // Manipulate the SVG DOM to add checkmarks for guessed countries
  const svgElement = useInlineSVG(
    fileName ? `/maps/${fileName}` : "",
    (svg: SVGSVGElement) => {
      guessedCountries.forEach((country) => {
        // Try to find the element by id (case-insensitive)
        const countryElem = svg.querySelector(`[id='${country}'], [id='${country.toLowerCase()}'], [id='${country.toUpperCase()}']`);
        if (!countryElem) return;
        // Get bounding box
        let bbox;
        try {
          bbox = (countryElem as SVGGraphicsElement).getBBox();
        } catch {
          return;
        }
        // Insert a checkmark at the center
        const check = document.createElementNS("http://www.w3.org/2000/svg", "text");
        check.textContent = "✅";
        check.setAttribute("x", String(bbox.x + bbox.width / 2));
        check.setAttribute("y", String(bbox.y + bbox.height / 2));
        check.setAttribute("font-size", String(Math.max(12, bbox.width / 3)));
        check.setAttribute("text-anchor", "middle");
        check.setAttribute("alignment-baseline", "middle");
        check.setAttribute("filter", "url(#dropShadow)");
        check.setAttribute("pointer-events", "none");
        svg.appendChild(check);
      });
      // Add drop shadow filter if not present
      if (!svg.querySelector("#dropShadow")) {
        const defs = svg.querySelector("defs") || svg.insertBefore(document.createElementNS("http://www.w3.org/2000/svg", "defs"), svg.firstChild);
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "dropShadow");
        filter.innerHTML = `<feDropShadow dx='0' dy='0' stdDeviation='2' flood-color='#2563eb' flood-opacity='0.7'/>`;
        defs.appendChild(filter);
      }
    }
  );

  if (!svgElement) {
    return <div className="mb-4 h-48 flex items-center justify-center text-blue-300">Loading map...</div>;
  }

  return (
    <div className="mb-4 w-full max-w-md mx-auto">
      {svgElement}
    </div>
  );
}
