import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, Locate, TrendingUp, Eye, Calendar } from "lucide-react";
import L from "leaflet";
import MapSidebar from "./MapSidebar";
import "leaflet/dist/leaflet.css";
import "../styles/MapSidebar.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createMarkerIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#81b29a" fill-opacity="0.9" stroke="#2d2a24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    className: "user-location-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

function AutoFitBounds({ observations, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const bounds = [];
    
    observations.forEach((obs) => {
      if (obs.location) {
        bounds.push([obs.location.lat, obs.location.lng]);
      }
    });
    
    if (userLocation) {
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [observations, userLocation, map]);

  return null;
}

function MapBoundsTracker({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    const updateBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    };

    updateBounds();

    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

function LocateUser({ userLocation, onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15, { duration: 1 });
    }
  }, [userLocation, map]);

  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          onLocationFound({ lat: latitude, lng: longitude, accuracy });
        },
        (err) => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  return (
    <button
      onClick={handleLocate}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title="Locate me"
    >
      <Locate size={20} color="#5f6368" />
    </button>
  );
}

export default function MapViewModern({ observations = [], userLocation, onObservationClick, user }) {
  const [mapCenter, setMapCenter] = useState([32.0603, 118.7969]);
  const [isLocating, setIsLocating] = useState(false);
  const [localUserLocation, setLocalUserLocation] = useState(userLocation);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  
  const observationsWithLocation = useMemo(
    () => observations.filter((obs) => obs.location),
    [observations]
  );

  const stats = useMemo(() => {
    const totalObservations = observations.length;
    const totalLikes = observations.reduce((sum, obs) => sum + (obs.likes || 0), 0);
    const uniqueSpecies = new Set(observations.map(obs => obs.species)).size;
    
    return {
      trails: totalObservations,
      distance: (totalObservations * 0.5).toFixed(1),
      species: uniqueSpecies,
      totalLikes,
    };
  }, [observations]);

  useEffect(() => {
    if (userLocation) {
      setLocalUserLocation(userLocation);
      setMapCenter([userLocation.lat, userLocation.lng]);
    } else if (observationsWithLocation.length > 0) {
      const firstObs = observationsWithLocation[0].location;
      setMapCenter([firstObs.lat, firstObs.lng]);
    }
  }, [userLocation, observationsWithLocation]);

  const latestObservations = useMemo(() => {
    return [...observations]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  }, [observations]);

  return (
    <div style={{
      height: "calc(100vh - 70px)",
      background: "#f8f9fa",
      backgroundImage: `
        radial-gradient(ellipse 800px 600px at 20% 40%, rgba(200, 210, 220, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse 600px 800px at 80% 70%, rgba(180, 190, 200, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse 400px 500px at 50% 20%, rgba(190, 200, 210, 0.2) 0%, transparent 50%)
      `,
      overflow: "auto",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>  
        <div style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
            }}>
              {user?.username?.charAt(0) || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "22px", color: "#2d3748" }}>
                Welcome, {user?.username || "Observer"}
              </h2>
              <p style={{ margin: 0, color: "#718096", fontSize: "14px" }}>
                {user?.bio || "Wildlife conservation enthusiast"}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#667eea", marginBottom: "5px" }}>
              {stats.trails}
            </div>
            <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <TrendingUp size={14} /> Total Trails
            </div>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#81b29a", marginBottom: "5px" }}>
              {stats.distance}
            </div>
            <div style={{ fontSize: "13px", color: "#666" }}>
              km Distance
            </div>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#e07a5f", marginBottom: "5px" }}>
              {stats.species}
            </div>
            <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <Eye size={14} /> Species Found
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            height: "400px",
            position: "relative",
          }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {observationsWithLocation.map((obs) => (
                <Marker
                  key={obs.id}
                  position={[obs.location.lat, obs.location.lng]}
                  icon={createMarkerIcon()}
                  eventHandlers={{
                    click: () => {
                      setSelectedObservation(obs);
                      onObservationClick && onObservationClick(obs);
                    },
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "150px" }}>
                      <strong>{obs.species}</strong>
                      <br />
                      <small>{obs.username}</small>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {localUserLocation && (
                <Marker
                  position={[localUserLocation.lat, localUserLocation.lng]}
                  icon={createUserLocationIcon()}
                />
              )}

              <AutoFitBounds observations={observationsWithLocation} userLocation={localUserLocation} />
              <LocateUser userLocation={localUserLocation} onLocationFound={setLocalUserLocation} />
              <MapBoundsTracker onBoundsChange={setMapBounds} />
            </MapContainer>

            <MapSidebar
              observations={observationsWithLocation}
              mapBounds={mapBounds}
              onObservationClick={(obs) => {
                setSelectedObservation(obs);
                onObservationClick && onObservationClick(obs);
              }}
              selectedObservationId={selectedObservation?.id}
            />
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}>
            {selectedObservation ? (
              <>
                {selectedObservation.photo && (
                  <div style={{
                    width: "180px",
                    height: "180px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginBottom: "20px",
                    border: "4px solid white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}>
                    <img
                      src={selectedObservation.photo}
                      alt={selectedObservation.species}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <h3 style={{ fontSize: "24px", margin: "0 0 10px 0", fontWeight: "bold", color: "#2d3748" }}>
                  {selectedObservation.species}
                </h3>
                <p style={{ fontSize: "14px", color: "#718096", margin: "0 0 15px 0" }}>
                  Scientific Recognition
                </p>
                <div style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  marginBottom: "15px",
                  color: "white",
                  fontWeight: "600",
                }}>
                  Confidence: {selectedObservation.confidence}%
                </div>
                <button
                  onClick={() => onObservationClick && onObservationClick(selectedObservation)}
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 30px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  View Details
                </button>
              </>
            ) : (
              <>
                <MapPin size={64} style={{ color: "#cbd5e0", marginBottom: "20px" }} />
                <h3 style={{ fontSize: "20px", margin: "0 0 10px 0", color: "#2d3748" }}>
                  Multi-Species Recognition
                </h3>
                <p style={{ fontSize: "14px", color: "#718096" }}>
                  Click on a marker to view species details
                </p>
              </>
            )}
          </div>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "25px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#2d2a24", display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={20} style={{ color: "#e07a5f" }} />
              Latest Observations
            </h3>
            <span style={{ fontSize: "12px", color: "#999" }}>
              {observations.length} total
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}>
            {latestObservations.map((obs) => (
              <div
                key={obs.id}
                onClick={() => {
                  setSelectedObservation(obs);
                  onObservationClick && onObservationClick(obs);
                }}
                style={{
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {obs.photo && (
                  <div style={{ height: "120px", overflow: "hidden" }}>
                    <img
                      src={obs.photo}
                      alt={obs.species}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ padding: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#2d2a24", marginBottom: "5px" }}>
                    {obs.species}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {obs.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
