import { useState } from "react";
import { Camera, Map, X } from "lucide-react";
import ARCameraView from "./ARCameraView";
import "../styles/NavigationPanel.css";

export default function NavigationPanel({ observation, latitude, longitude, onClose }) {
  const [mode, setMode] = useState("ar");

  if (!observation || latitude == null || longitude == null) {
    return null;
  }

  if (mode === "ar") {
    return (
      <ARCameraView
        targetLocation={{ lat: latitude, lng: longitude, accuracy: observation.location?.accuracy }}
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
            Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
