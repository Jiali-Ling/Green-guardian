import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { X, MapPin, Info, Share2, BookmarkPlus, Camera, Pencil, Check, Image } from "lucide-react";
import { GetPhotoSrc } from "../db";
import "../styles/SpeciesDetailModal.css";

export default function SpeciesDetailModal({ observation, onClose, onEditObservation, latitude, longitude, onViewSimilar, currentUserId, onTogglePublic, children }) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");

  const photoFromDb = GetPhotoSrc(observation?.id);
  const savedObservationKey = "green_guardian_saved_observation_ids";

  useEffect(() => {
    if (!observation?.id) {
      setIsSaved(false);
      return;
    }

    try {
      const savedRaw = localStorage.getItem(savedObservationKey);
      const savedIds = savedRaw ? JSON.parse(savedRaw) : [];
      setIsSaved(Array.isArray(savedIds) && savedIds.includes(observation.id));
    } catch (e) {
      setIsSaved(false);
    }
  }, [observation?.id]);

  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(""), 1500);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${observation.species} Observation`,
          text: `I observed ${observation.species} on Green Guardian!`,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  const handleToggleSave = () => {
    try {
      const savedRaw = localStorage.getItem(savedObservationKey);
      const savedIds = savedRaw ? JSON.parse(savedRaw) : [];
      const currentIds = Array.isArray(savedIds) ? savedIds : [];
      const nextSaved = !currentIds.includes(observation.id);
      const nextIds = nextSaved
        ? [...currentIds, observation.id]
        : currentIds.filter((id) => id !== observation.id);

      localStorage.setItem(savedObservationKey, JSON.stringify(nextIds));
      setIsSaved(nextSaved);
      setSaveNotice(nextSaved ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (e) {
      setSaveNotice("Unable to update bookmarks");
    }
  };

  if (!observation) return null;

  const isOwner = observation.userId === currentUserId;
  const renderPhotoSrc = photoFromDb || observation.photo || null;
  const mapHref =
    latitude != null && longitude != null
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;
  const smsHref =
    latitude != null && longitude != null
      ? `sms:?&body=${encodeURIComponent(`Wildlife location: ${latitude}, ${longitude}`)}`
      : null;

  const viewTemplate = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="species-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {renderPhotoSrc && (
          <div className="species-photo">
            <img src={renderPhotoSrc} alt={observation.species} />
          </div>
        )}

        <div className="species-content">
          <div className="species-header">
            <div>
              <h2 className="species-name">{observation.species}</h2>
              {observation.scientificName && (
                <p className="scientific-name">{observation.scientificName}</p>
              )}
            </div>
            <div className="action-buttons">
              {isOwner && typeof onEditObservation === "function" && (
                <button
                  className="btn-icon-round"
                  onClick={() => onEditObservation(observation)}
                  aria-label="Edit"
                  title="Edit this observation"
                  type="button"
                >
                  <Pencil size={20} />
                  <span className="btn-label">Edit</span>
                </button>
              )}
              <button className="btn-icon-round" onClick={handleShare} aria-label="Share" title="Share this observation">
                <Share2 size={20} />
                <span className="btn-label">Share</span>
              </button>
              <button
                className={`btn-icon-round ${isSaved ? "btn-icon-round--active" : ""}`}
                onClick={handleToggleSave}
                aria-label={isSaved ? "Saved" : "Save"}
                title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
                type="button"
              >
                {isSaved ? <Check size={20} /> : <BookmarkPlus size={20} />}
                <span className="btn-label">{isSaved ? "Saved" : "Save"}</span>
              </button>

              <Popup
                trigger={(
                  <button
                    className="btn-icon-round"
                    aria-label="View Photo"
                    title="View Photo"
                    type="button"
                  >
                    <Image size={20} />
                    <span className="btn-label">View Photo</span>
                  </button>
                )}
                modal
                nested
                lockScroll
                overlayStyle={{ zIndex: 4200, background: "rgba(0, 0, 0, 0.72)" }}
                contentStyle={{
                  zIndex: 4201,
                  border: "none",
                  background: "transparent",
                  width: "min(92vw, 560px)",
                  padding: 0,
                }}
              >
                {(close) => (
                  <div className="photo-popup">
                    <div className="photo-popup-header">
                      <h3>View Photo</h3>
                      <button className="btn-icon-round" onClick={close} type="button">
                        <X size={16} />
                        <span className="btn-label">Close</span>
                      </button>
                    </div>
                    {photoFromDb ? (
                      <img className="photo-preview" src={photoFromDb} alt="Observation photo from IndexedDB" />
                    ) : (
                      <p className="photo-empty">No photo saved in IndexedDB for this observation yet.</p>
                    )}
                  </div>
                )}
              </Popup>
            </div>
          </div>

          {saveNotice && <div className="save-notice" role="status">{saveNotice}</div>}

          {observation.description && (
            <div className="info-section">
              <h3>
                <Info size={18} />
                Description
              </h3>
              <p>{observation.description}</p>
            </div>
          )}

          {latitude != null && longitude != null && (
            <div className="info-section">
              <h3>
                <MapPin size={18} />
                Location
              </h3>
              <p className="location-text">
                Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                <br />
                <span className="accuracy">Accuracy: ±{Math.round(observation.location?.accuracy)}m</span>
              </p>
              <p className="location-inline">
                <a href={mapHref} target="_blank" rel="noopener noreferrer">(map)</a>
                &nbsp;|&nbsp; lo {longitude.toFixed(6)}
                {smsHref && (
                  <>
                    &nbsp;|&nbsp;<a href={smsHref}>(sms)</a>
                  </>
                )}
              </p>
              <div className="location-actions">
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline"
                >
                  <MapPin size={18} />
                  View on Map
                </a>
                {smsHref && (
                  <a href={smsHref} className="btn btn--outline btn--sms">
                    Share via SMS
                  </a>
                )}
              </div>
            </div>
          )}

          {observation.allPredictions && observation.allPredictions.length > 1 && (
            <div className="info-section">
              <h3>Alternative Identifications</h3>
              <div className="predictions-list">
                {observation.allPredictions.slice(1, 4).map((pred, index) => (
                  <div key={index} className="prediction-item">
                    <span className="pred-name">{pred.species}</span>
                    <span className="pred-confidence">{pred.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="info-section">
            <p className="timestamp">
              <Camera size={16} />
              Observed on {new Date(observation.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>

          {isOwner && (
            <div className="modal-toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={observation.isPublic !== false}
                  onChange={() => onTogglePublic(observation.id)}
                />
                <span>Visible to Community</span>
              </label>
            </div>
          )}

          {children}

          {onViewSimilar && (
            <button className="btn btn--primary btn-full" onClick={onViewSimilar}>
              View Similar Observations in Community
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return viewTemplate;
}
