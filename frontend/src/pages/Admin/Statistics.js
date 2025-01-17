import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { usePlot } from '../../hooks/usePlot';

export default function SearchDB() {

  return (
    <div>
     {/* Übersicht Section */}
     <div className="mb-8">
        <h2 className="text-xl font-semibold text-rubBlue mb-4">Übersicht</h2>

        {/* Statistiken */}
        <Statistik />
      </div>
    </div>
  );
};

function Statistik() {
    const { plots, analyses } = usePlot();
  
    return (
      <div className="relative block items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Statistiken:</h3>
        <p className="text-gray-600">Statistiken werden hier angezeigt.</p>
        {analyses.map(({ key, label }) => (
          <CollapsiblePlot
            key={key}
            label={label}
            plotData={plots[key]?.data}
            plotLayout={plots[key]?.layout}
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
              <p>Lade {label}...</p>
            )}
          </div>
        )}
      </div>
    );
  }