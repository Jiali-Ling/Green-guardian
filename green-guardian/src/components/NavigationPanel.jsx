import { useEffect, useState } from "react";
import { Camera, Map, X, Navigation, MapPin } from "lucide-react";
import ARCameraView from "./ARCameraView";
import { calculateDistance } from "../hooks/useGeolocation";
import "../styles/NavigationPanel.css";

export default function NavigationPanel({ observation, latitude, longitude, onClose }) {
  const [mode, setMode] = useState("map");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("This browser does not support live directions.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError("");
      },
      (error) => {
        if (error.code === 1) {
          setLocationError("Location permission was denied. You can still open the observation on the map.");
          return;
        }
        setLocationError("Unable to read your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

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

  const googleDirectionsHref = currentLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${latitude},${longitude}&travelmode=walking`
    : `https://www.google.com/maps?q=${latitude},${longitude}`;

  const openStreetMapHref = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  const distanceText = currentLocation
    ? `${(calculateDistance(currentLocation.lat, currentLocation.lng, latitude, longitude) / 1000).toFixed(2)} km away`
    : "Current distance unavailable";

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
        <div className="nav-route-card">
          <div className="nav-route-meta">
            <div className="nav-route-row">
              <MapPin size={18} />
              <div>
                <strong>Target location</strong>
                <p>{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
              </div>
            </div>

            <div className="nav-route-row">
              <Navigation size={18} />
              <div>
                <strong>Distance</strong>
                <p>{distanceText}</p>
              </div>
            </div>

            {currentLocation?.accuracy ? (
              <p className="nav-route-note">
                Your location accuracy: ±{Math.round(currentLocation.accuracy)}m
              </p>
            ) : null}

            {locationError ? (
              <p className="nav-route-note">{locationError}</p>
            ) : null}
          </div>

          <div className="nav-route-actions">
            <a
              className="nav-action-btn nav-action-btn--primary"
              href={googleDirectionsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation size={18} />
              Open directions
            </a>

            <a
              className="nav-action-btn"
              href={openStreetMapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Map size={18} />
              Open in OpenStreetMap
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
