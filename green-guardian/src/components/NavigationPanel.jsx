import { useState } from "react";
import { Camera, Map, X } from "lucide-react";
import ARCameraView from "./ARCameraView";
import "../styles/NavigationPanel.css";

export default function NavigationPanel({ observation, onClose }) {
  const [mode, setMode] = useState("ar");

  if (!observation || !observation.location) {
    return null;
  }

  if (mode === "ar") {
    return (
      <ARCameraView
        targetLocation={observation.location}
        targetName={observation.species}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="navigation-panel">
      <div className="nav-panel-header">
        <h2>Navigate to {observation.species}</h2>
        <button className="nav-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="nav-mode-toggle">
        <button
          className={`mode-btn ${mode === "ar" ? "active" : ""}`}
          onClick={() => setMode("ar")}
        >
          <Camera size={18} />
          AR View
        </button>
        <button
          className={`mode-btn ${mode === "map" ? "active" : ""}`}
          onClick={() => setMode("map")}
        >
          <Map size={18} />
          Map View
        </button>
      </div>

      <div className="nav-content">
        <div className="map-placeholder">
          <Map size={64} />
          <p>Map directions view (integration with map component)</p>
          <p className="map-hint">
            Location: {observation.location.lat.toFixed(4)}, {observation.location.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
