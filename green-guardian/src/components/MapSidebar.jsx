import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Eye } from "lucide-react";
import "../styles/MapSidebar.css";

export default function MapSidebar({ 
  observations = [], 
  mapBounds = null, 
  onObservationClick,
  selectedObservationId = null 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleObservations = useMemo(() => {
    if (!mapBounds) return observations;

    return observations.filter((obs) => {
      if (!obs.location) return false;
      return mapBounds.contains([obs.location.lat, obs.location.lng]);
    });
  }, [observations, mapBounds]);

  const sortedObservations = useMemo(() => {
    return [...visibleObservations].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [visibleObservations]);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days === 0) {
      if (hours === 0) return "Just now";
      return `${hours}h ago`;
    }
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <div className={`map-sidebar ${isCollapsed ? "map-sidebar--collapsed" : ""}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {!isCollapsed && (
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h3 className="sidebar-title">
                <Eye size={18} />
                Observations in View
              </h3>
              <span className="sidebar-count">{sortedObservations.length}</span>
            </div>

            <div className="sidebar-list">
              {sortedObservations.length === 0 ? (
                <div className="sidebar-empty">
                  <MapPin size={40} />
                  <p>No observations in current view</p>
                  <small>Pan or zoom the map to find observations</small>
                </div>
              ) : (
                sortedObservations.map((obs) => (
                  <div
                    key={obs.id}
                    className={`sidebar-item ${selectedObservationId === obs.id ? "sidebar-item--selected" : ""}`}
                    onClick={() => onObservationClick && onObservationClick(obs)}
                  >
                    {obs.photo ? (
                      <div className="sidebar-item-image">
                        <img src={obs.photo} alt={obs.species} />
                      </div>
                    ) : (
                      <div className="sidebar-item-image sidebar-item-image--placeholder">
                        <MapPin size={24} />
                      </div>
                    )}

                    <div className="sidebar-item-content">
                      <h4 className="sidebar-item-title">{obs.species || "Unknown Species"}</h4>
                      <div className="sidebar-item-meta">
                        <span className="meta-item">
                          <Clock size={12} />
                          {getTimeAgo(obs.createdAt)}
                        </span>
                        {obs.username && (
                          <span className="meta-item">
                            by {obs.username}
                          </span>
                        )}
                      </div>
                      {obs.confidence && (
                        <div className="sidebar-item-confidence">
                          {obs.confidence}% confident
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isCollapsed && (
        <div className="sidebar-collapsed-indicator">
          <div className="indicator-content">
            <Eye size={16} />
            <span>{sortedObservations.length}</span>
          </div>
        </div>
      )}
    </>
  );
}
