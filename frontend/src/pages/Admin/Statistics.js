import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { usePlot } from '../../hooks/usePlot';

export default function SearchDB() {

  return (
    <div>
     {/* Übersicht Section */}
     <div className="mb-8">
        <h2 className="text-xl font-semibold text-rubBlue mb-4">Statistiken</h2>

        {/* Statistiken */}
        <Statistik />
      </div>
    </div>
  );
};

function Statistik() {
    const { plots, analyses, source, setSource } = usePlot();

    const handleSourceChange = (event) => {
      setSource(event.target.value);
    };
  
    return (
      <div className="relative block items-center mb-4">
        <div className="mb-4">
          <label className="font-medium text-gray-700 mr-2">Datenquelle für die Analyse:</label>
          <select
            value={source}
            onChange={handleSourceChange}
            className="block w-full appearance-none border border-gray-300 bg-white text-gray-700 py-2 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">Abgegebene Lottoscheine</option>
            <option value="historic">Historische Lottozahlen</option>
            <option value="random" >Scheine mit zufällig generierten Zahlen</option>
          </select>
        </div>
        {analyses.map(({ key, label }) => (
        <CollapsiblePlot
          key={`${key}_${source}`}
          label={`${label} (${source === 'user' ? 'Benutzer' : source === 'historic' ? 'Historisch' : 'Zufällig'})`}
          plotData={plots[`${key}_${source}`]?.data}
          plotLayout={plots[`${key}_${source}`]?.layout}
        />
        ))}
      </div>
    );
  }
  
  function CollapsiblePlot({ label, plotData, plotLayout }) {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleOpen = () => setIsOpen((prev) => !prev);
  
    return (
      <div className="w-full mb-4">
        <button
          className="w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md shadow"
          onClick={toggleOpen}
        >
          {isOpen ? `▼ ${label}` : `► ${label}`}
        </button>
        {isOpen && (
          <div className="mt-2">
            {plotData ? (
              <Plot
                data={plotData}
                layout={{
                  ...plotLayout,
                  autosize: true,
                  margin: { t: 150, b: 40, l: 40, r: 40 }, // Platz für Untertitel und Inhalte
                }}
                config={{
                  responsive: true, // Diagramm passt sich dynamisch an
                  displayModeBar: true, // Plotly-Buttons anzeigen
                  modeBarButtonsToRemove: [
                    "zoom2d",
                    "pan2d",
                    "select2d",
                    "lasso2d",
                    "zoomIn2d",
                    "zoomOut2d",
                    "autoScale2d",
                    "resetScale2d",
                    "hoverClosestCartesian",
                    "hoverCompareCartesian",
                  ],
                }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                Lade {label}...
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }