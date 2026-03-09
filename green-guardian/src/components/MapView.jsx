import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Locate, Plus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createEmojiIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#e07a5f" fill-opacity="0.2" stroke="#e07a5f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#81b29a" stroke="#81b29a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
    className: "user-location-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

function LocateUser({ userLocation, onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.5 });
    }
  }, [userLocation, map]);

  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          onLocationFound({ lat: latitude, lng: longitude, accuracy });
        },
        (err) => {
          alert(`Unable to get location: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Your browser does not support geolocation");
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleLocate}
          style={{
            width: '34px',
            height: '34px',
            background: 'white',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Refresh current location"
        >
          <Locate size={18} />
        </button>
      </div>
    </div>
  );
}

function AutoFitBounds({ cards }) {
  const map = useMap();

  useEffect(() => {
    const cardsWithLocation = cards.filter((c) => c.location);
    if (cardsWithLocation.length > 0) {
      const bounds = cardsWithLocation.map((c) => [c.location.lat, c.location.lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [cards, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  const [clickedPosition, setClickedPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setClickedPosition(e.latlng);
    },
  });

  return clickedPosition ? (
    <Popup
      position={clickedPosition}
      onClose={() => setClickedPosition(null)}
    >
      <div style={{ textAlign: "center", padding: "8px" }}>
        <p style={{ margin: "0 0 12px 0", fontWeight: "bold" }}>
          <MapPin size={18} className="inline-block mr-2" /> Add story here?
        </p>
        <button
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "#81b29a",
            border: "2px solid #2d2a24",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
          onClick={() => {
            onMapClick(clickedPosition);
            setClickedPosition(null);
          }}
        >
          + Create New Story
        </button>
      </div>
    </Popup>
  ) : null;
}

export default function MapView({ observations = [], userLocation, onObservationClick }) {
  const [mapCenter, setMapCenter] = useState([32.0603, 118.7969]);
  const [isLocating, setIsLocating] = useState(true);
  const [localUserLocation, setLocalUserLocation] = useState(userLocation);
  
  const observationsWithLocation = useMemo(
    () => observations.filter((obs) => obs.location),
    [observations]
  );

  useEffect(() => {
    const locationTimeout = setTimeout(() => {
      setIsLocating(false);
    }, 5000);

    if (userLocation) {
      clearTimeout(locationTimeout);
      setLocalUserLocation(userLocation);
      setMapCenter([userLocation.lat, userLocation.lng]);
      setIsLocating(false);
    } else if (observationsWithLocation.length > 0) {
      clearTimeout(locationTimeout);
      const firstObs = observationsWithLocation[0].location;
      setMapCenter([firstObs.lat, firstObs.lng]);
      setIsLocating(false);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(locationTimeout);
          const { latitude, longitude, accuracy } = pos.coords;
          const userPos = { lat: latitude, lng: longitude, accuracy };
          setLocalUserLocation(userPos);
          setMapCenter([latitude, longitude]);
          setIsLocating(false);
        },
        (err) => {
          clearTimeout(locationTimeout);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
      );
    } else {
      clearTimeout(locationTimeout);
      setIsLocating(false);
    }

    return () => clearTimeout(locationTimeout);
  }, [userLocation, observationsWithLocation]);

  return (
    <div className="mapView">
      {isLocating && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '2px solid #2d2a24',
          fontWeight: 'bold'
        }}>
          <Locate size={18} className="inline-block mr-2" /> Locating...
        </div>
      )}
      <div className="mapContainerWrapper">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%", borderRadius: "18px" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {observationsWithLocation.map((obs) => (
            <Marker
              key={obs.id}
              position={[obs.location.lat, obs.location.lng]}
              icon={createEmojiIcon()}
              eventHandlers={{
                click: () => onObservationClick && onObservationClick(obs),
              }}
            >
              <Popup>
                <div style={{ maxWidth: "200px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>{obs.species || "Unknown Species"}</h3>
                  {obs.confidence > 0 && (
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
                      Confidence: {obs.confidence}%
                    </p>
                  )}
                  {obs.photo && (
                    <img
                      src={obs.photo}
                      alt={obs.species}
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    />
                  )}
                  <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
                    {obs.username || "Anonymous"} • {new Date(obs.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      padding: "8px",
                      background: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    onClick={() => onObservationClick && onObservationClick(obs)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {localUserLocation && (
            <Marker
              position={[localUserLocation.lat, localUserLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>You are here</p>
                  <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                    Accuracy: ±{Math.round(localUserLocation.accuracy || 0)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {observationsWithLocation.length > 0 && <AutoFitBounds cards={observationsWithLocation} />}
          <LocateUser userLocation={localUserLocation} onLocationFound={setLocalUserLocation} />
        </MapContainer>
      </div>
    </div>
  );
}
