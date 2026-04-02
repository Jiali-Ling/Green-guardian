import { useState, useEffect } from "react";
import { Moon, Sun, WifiOff, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { nanoid } from "nanoid";
import { sampleObservations, defaultUser } from "./data/sampleObservations";
import {
  addPhoto,
  dbReady,
  getAllObservationsFromDb,
  getUserFromDb,
  replaceAllObservationsInDb,
  replaceAllPhotosInDb,
  setUserInDb,
} from "./db";
import usePersistedState from "./hooks/usePersistedState";
import BottomNav from "./components/BottomNav";
import BottomSheetModal from "./components/BottomSheetModal";
import CommentSection from "./components/CommentSection";
import CommunityFeed from "./components/CommunityFeed";
import HomePage from "./components/HomePage";
import MapViewModern from "./components/MapViewModern";
import NavigationPanel from "./components/NavigationPanel";
import SpeciesDetailModal from "./components/SpeciesDetailModal";
import SpeciesScanner from "./components/SpeciesScanner";
import UserProfile from "./components/UserProfile";
import "./App.css";
import "./styles/BottomNav.css";
import "./styles/BottomSheetModal.css";
import "./styles/CommentSection.css";
import "./styles/CommunityFeed.css";
import "./styles/HomePage.css";
import "./styles/MapView.css";
import "./styles/NavigationPanel.css";
import "./styles/SpeciesDetailModal.css";
import "./styles/SpeciesScanner.css";
import "./styles/UserProfile.css";


const OBSERVATIONS_STORAGE_KEY = "green_guardian_observations";
const USER_STORAGE_KEY = "green_guardian_user";

function readLocalStorageValue(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function normalizeObservation(observation) {
  return {
    ...observation,
    comments: Array.isArray(observation?.comments) ? observation.comments : [],
    isPublic: observation?.isPublic !== false,
    photoed:
      typeof observation?.photoed === "boolean"
        ? observation.photoed
        : Boolean(observation?.photo),
  };
}

function normalizeObservations(observations) {
  if (!Array.isArray(observations)) {
    return sampleObservations.map(normalizeObservation);
  }
  return observations.map(normalizeObservation);
}

function needsObservationNormalization(observations) {
  return Array.isArray(observations) && observations.some(
    (observation) =>
      !Array.isArray(observation?.comments) ||
      observation?.isPublic === undefined ||
      observation?.photoed === undefined
  );
}

export default function App({ initialObservations }) {
  const [currentView, setCurrentView] = useState("home");
  const [isDark, setIsDark] = usePersistedState("gg_dark_mode", false);
  const [isOnline, setIsOnline] = useState(navigator.onLine ?? true);

  const [observations, setObservations] = useState(() =>
    normalizeObservations(
      readLocalStorageValue(
        OBSERVATIONS_STORAGE_KEY,
        initialObservations ?? sampleObservations
      )
    )
  );
  const [user, setUser] = useState(() =>
    readLocalStorageValue(USER_STORAGE_KEY, {
      ...defaultUser,
      id: nanoid(),
    })
  );
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const [lastInsertedId, setLastInsertedId] = useState(null);
  const [editingObservation, setEditingObservation] = useState(null);
  const [editForm, setEditForm] = useState({
    species: "",
    description: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
  });
  const [isDexieReady, setIsDexieReady] = useState(false);
  const [locationNotice, setLocationNotice] = useState({
    type: "",
    message: "",
  });


  // Shared state updaters keep observation mutations easy to scan.
  function updateObservationById(observationId, updater) {
    if (!observationId || typeof updater !== "function") return;
    setObservations((prev) =>
      prev.map((observation) =>
        observation.id === observationId ? updater(observation) : observation
      )
    );
  }

  function updateSelectedObservationById(observationId, updater) {
    if (!observationId || typeof updater !== "function") return;
    setSelectedObservation((prev) =>
      prev?.id === observationId ? updater(prev) : prev
    );
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!locationNotice.message) return;

    const timer = window.setTimeout(() => {
      setLocationNotice({ type: "", message: "" });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [locationNotice]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromDexie = async () => {
      try {
        await dbReady;
        const [dbObservations, dbUser] = await Promise.all([
          getAllObservationsFromDb(),
          getUserFromDb(),
        ]);

        if (cancelled) return;

        if (Array.isArray(dbObservations) && dbObservations.length > 0) {
          setObservations(normalizeObservations(dbObservations));
        } else {
          await replaceAllObservationsInDb(observations);
        }

        if (dbUser) {
          setUser(dbUser);
        } else {
          await setUserInDb(user);
        }
      } catch (error) {
        console.error("Failed to save user to localStorage:", error);
      } finally {
        if (!cancelled) {
          setIsDexieReady(true);
        }
      }
    };

    hydrateFromDexie();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(OBSERVATIONS_STORAGE_KEY, JSON.stringify(observations));
    } catch (error) {
      console.error("Failed to save observations to localStorage:", error);
    }
  }, [observations]);

  useEffect(() => {
    if (!isDexieReady) return;
    replaceAllObservationsInDb(observations).catch(() => {});
    replaceAllPhotosInDb(observations).catch(() => {});
  }, [observations, isDexieReady]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!isDexieReady) return;
    setUserInDb(user).catch(() => {});
  }, [user, isDexieReady]);

  useEffect(() => {
    if (observations.length === 0) {
      setObservations(normalizeObservations(initialObservations ?? sampleObservations));
      return;
    }

    if (needsObservationNormalization(observations)) {
      setObservations((prev) => normalizeObservations(prev));
    }
  }, []);

  function locateObservation(observationId, coords) {
    if (!observationId) return;
    const now = Date.now();

    updateObservationById(observationId, (observation) => ({
      ...observation,
      location: coords,
      updatedAt: now,
    }));

    updateSelectedObservationById(observationId, (observation) => ({
      ...observation,
      location: coords,
      updatedAt: now,
    }));
  }

  function handleGeolocationSuccess(position, observationId = null) {
    const latitude = Number(position?.coords?.latitude);
    const longitude = Number(position?.coords?.longitude);
    const accuracy = Number(position?.coords?.accuracy);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(accuracy) ||
      accuracy <= 0
    ) {
      setLocationNotice({
        type: "warning",
        message: "Location signal is weak. Please try again in an open area.",
      });
      return;
    }

    const coords = {
      lat: latitude,
      lng: longitude,
      accuracy,
    };

    setUserLocation(coords);

    const targetId = observationId ?? lastInsertedId;
    if (targetId) {
      locateObservation(targetId, coords);
      setLastInsertedId(null);
    }
  }

  function handleGeolocationError() {
    setLocationNotice({
      type: "error",
      message: "Unable to retrieve your location. Check GPS permission and try again.",
    });
  }

  function geoFindMe(observationId = null) {
    if (!navigator.geolocation) {
      setLocationNotice({
        type: "warning",
        message: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => handleGeolocationSuccess(position, observationId),
      () => handleGeolocationError(),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  useEffect(() => {
    geoFindMe();
  }, []);

  // Observation CRUD
  function addObservation(speciesData) {
    const now = Date.now();
    const newObservation = {
      id: nanoid(),
      ...speciesData,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      likes: 0,
      likedBy: [],
      comments: [],
      isPublic: true,
      photoed: Boolean(speciesData?.photo),
      location: speciesData.location ?? null,
      createdAt: now,
      updatedAt: now,
    };

    setObservations((prev) => [newObservation, ...prev]);
    setSelectedObservation(newObservation);
    setLastInsertedId(newObservation.id);
    geoFindMe(newObservation.id);
    addPhoto(newObservation.id, newObservation.photo).catch(() => {});
    return newObservation.id;
  }

  function selectObservation(observation) {
    setSelectedObservation(observation);
  }

  function closeObservationDetail() {
    setSelectedObservation(null);
    setCurrentView((prev) => (prev === "map" ? "map" : "feed"));
  }

  function closeMapObservationDetail() {
    setSelectedObservation(null);
  }

  function editObservation(observationId, updates) {
    const now = Date.now();

    updateObservationById(observationId, (observation) => ({
      ...observation,
      ...updates,
      updatedAt: now,
    }));

    updateSelectedObservationById(observationId, (observation) => ({
      ...observation,
      ...updates,
      updatedAt: now,
    }));
  }

  function handleEditObservation(observation) {
  if (!observation?.id) return;

  setSelectedObservation(null);
  
  setEditingObservation(observation);
  setEditForm({
    species: observation.species || "",
    description: observation.description || observation.notes || "",
  });
}

function closeEditObservationModal() {
  setEditingObservation(null);
  setEditForm({
    species: "",
    description: "",
  });
}

function submitEditObservation(e) {
  e.preventDefault();

  if (!editingObservation?.id) return;

  const species = editForm.species.trim();
  const description = editForm.description.trim();

  if (!species) return;

  editObservation(editingObservation.id, {
    species,
    description,
  });

  closeEditObservationModal();
}

  function likeObservation(observationId) {
  if (!observationId) return;

  const now = Date.now();

  const toggleLike = (observation) => {
    const likedBy = Array.isArray(observation.likedBy)
      ? observation.likedBy
      : [];

    const hasLiked = likedBy.includes(user.id);

    const nextLikedBy = hasLiked
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];

    return {
      ...observation,
      likedBy: nextLikedBy,
      likes: nextLikedBy.length,
      updatedAt: now,
    };
  };

  updateObservationById(observationId, toggleLike);
  updateSelectedObservationById(observationId, toggleLike);
}

  function toggleObservationVisibility(observationId) {
  if (!observationId) return;

  const now = Date.now();
  const toggleVisibility = (observation) => ({
    ...observation,
    isPublic: observation.isPublic === false,
    updatedAt: now,
  });

  updateObservationById(observationId, toggleVisibility);
  updateSelectedObservationById(observationId, toggleVisibility);
}

  function photoedTask(id) {
    if (!id) {
      setCurrentView("feed");
      return;
    }

    console.log("photoedTask", id);
    const now = Date.now();

    updateObservationById(id, (observation) => ({
      ...observation,
      photoed: true,
      updatedAt: now,
    }));

    updateSelectedObservationById(id, (observation) => ({
      ...observation,
      photoed: true,
      updatedAt: now,
    }));

    setCurrentView("feed");
  }

  function handleScannerSaved(id) {
    photoedTask(id);
  }

  function deleteObservation(observationId) {
  setObservations((prev) => prev.filter((obs) => obs.id !== observationId));
  if (selectedObservation?.id === observationId) {
    setSelectedObservation(null);
  }
}

function removeCommentBranch(comments = [], rootCommentId) {
  const idsToDelete = new Set([rootCommentId]);
  let addedNewChild = true;

  while (addedNewChild) {
    addedNewChild = false;

    for (const comment of comments) {
      if (
        comment.parentId &&
        idsToDelete.has(comment.parentId) &&
        !idsToDelete.has(comment.id)
      ) {
        idsToDelete.add(comment.id);
        addedNewChild = true;
      }
    }
  }

  return comments.filter((comment) => !idsToDelete.has(comment.id));
}

// Observation comments CRUD
function addObservationComment(observationId, commentText, parentId = null) {
  const text = commentText?.trim();
  if (!observationId || !text) return;

  const now = Date.now();
  const newComment = {
    id: nanoid(),
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    text,
    parentId,
    likes: 0,
    createdAt: now,
  };

  const appendComment = (observation) => ({
    ...observation,
    comments: [...(observation.comments || []), newComment],
    updatedAt: now,
  });

  updateObservationById(observationId, appendComment);
  updateSelectedObservationById(observationId, appendComment);
}

function likeObservationComment(observationId, commentId) {
  if (!observationId || !commentId) return;

  const now = Date.now();
  const bumpCommentLike = (observation) => ({
    ...observation,
    comments: (observation.comments || []).map((comment) =>
      comment.id === commentId
        ? { ...comment, likes: (comment.likes || 0) + 1 }
        : comment
    ),
    updatedAt: now,
  });

  updateObservationById(observationId, bumpCommentLike);
  updateSelectedObservationById(observationId, bumpCommentLike);
}

function deleteObservationComment(observationId, commentId) {
  if (!observationId || !commentId) return;

  const now = Date.now();
  const removeComment = (observation) => ({
    ...observation,
    comments: removeCommentBranch(observation.comments || [], commentId),
    updatedAt: now,
  });

  updateObservationById(observationId, removeComment);
  updateSelectedObservationById(observationId, removeComment);
}

  // User profile actions
  function editUserProfile() {
    setProfileForm({
      username: user.username || "",
      bio: user.bio || "",
    });
    setIsEditingProfile(true);
  }

  function closeEditProfileModal() {
    setIsEditingProfile(false);
    setProfileForm({
      username: "",
      bio: "",
    });
  }

  function submitEditProfile(e) {
    e.preventDefault();

    const username = profileForm.username.trim();
    const bio = profileForm.bio.trim();

    if (!username) return;

    setUser((prev) => ({
      ...prev,
      username,
      bio: bio || prev.bio,
    }));

    closeEditProfileModal();
  }

  function updateUserAvatar(avatarDataUrl) {
    setUser((prev) => ({ ...prev, avatar: avatarDataUrl }));
  }

  function logoutUser() {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      setUser({
        id: nanoid(),
        username: "Wildlife Observer",
        bio: "Exploring and documenting wildlife around the world",
        avatar: null,
      });
      setSelectedObservation(null);
      setEditingObservation(null);
      setNavigationTarget(null);
      setCurrentView("feed");
    }
  }

  return (
    <div className="app-container">
      {!isOnline && (
        <div className="offline-banner" role="alert">
          <WifiOff size={16} />
          <span>You're offline — cached pages and local data are still available</span>
        </div>
     )}

     {locationNotice.message && (
      <div className={`geo-banner geo-banner--${locationNotice.type || "info"}`} role="status">
        <MapPin size={16} />
        <span>{locationNotice.message}</span>
      </div>
      )}

      <div className="view-container">
        {currentView === "home" && (
          <HomePage onNavigate={setCurrentView} />
        )}

        {currentView === "feed" && (
          <CommunityFeed
            observations={observations}
            currentUserId={user.id}
            onSelectObservation={selectObservation}
            onDeleteObservation={deleteObservation}
            onTogglePublic={toggleObservationVisibility}
            onLikeObservation={likeObservation}
          />
        )}

        {currentView === "scan" && (
          <SpeciesScanner
            addObservation={addObservation}
            photoedTask={photoedTask}
            geoFindMe={geoFindMe}
            onSaved={handleScannerSaved}
            onCancel={() => setCurrentView("feed")}
          />
        )}

        {currentView === "map" && (
          <MapViewModern
            observations={observations}
            userLocation={userLocation}
            onObservationClick={selectObservation}
            user={user}
          />
        )}

        {currentView === "profile" && (
          <UserProfile
            user={user}
            observations={observations}
            onEditProfile={editUserProfile}
            onLogout={logoutUser}
            onDeleteObservation={deleteObservation}
            onObservationClick={selectObservation}
            onUpdateAvatar={updateUserAvatar}
          />
        )}
      </div>

      {currentView !== "scan" && (
        <BottomNav
          currentView={currentView}
          onNavigate={setCurrentView}
          isDark={isDark}
          onToggleDark={() => setIsDark(d => !d)}
        />
      )}
      {currentView !== "scan" && (
        <button
          className="mobile-dark-toggle"
          onClick={() => setIsDark(d => !d)}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      {selectedObservation && currentView === "map" ? (
        <BottomSheetModal
          observation={selectedObservation}
          latitude={selectedObservation.location?.lat}
          longitude={selectedObservation.location?.lng}
          onClose={closeMapObservationDetail}
          currentUserId={user.id}
          onTogglePublic={toggleObservationVisibility}
          onNavigate={(observation) => {
            setNavigationTarget(observation);
            setSelectedObservation(null);
          }}
        >
          <CommentSection
            observationId={selectedObservation.id}
            comments={selectedObservation.comments || []}
            currentUserId={user.id}
            currentUsername={user.username}
            onAddComment={addObservationComment}
            onLikeComment={likeObservationComment}
            onDeleteComment={deleteObservationComment}
          />
        </BottomSheetModal>
      ) : selectedObservation ? (
        <SpeciesDetailModal
          observation={selectedObservation}
          latitude={selectedObservation.location?.lat}
          longitude={selectedObservation.location?.lng}
          onClose={closeObservationDetail}
          onEditObservation={handleEditObservation}
          currentUserId={user.id}
          onTogglePublic={toggleObservationVisibility}
        >
          <CommentSection
            observationId={selectedObservation.id}
            comments={selectedObservation.comments || []}
            currentUserId={user.id}
            currentUsername={user.username}
            onAddComment={addObservationComment}
            onLikeComment={likeObservationComment}
            onDeleteComment={deleteObservationComment}
          />
        </SpeciesDetailModal>
      ) : null}

            {editingObservation && (
              <div
                className="edit-observation-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-observation-title"
              >
                <div className="edit-observation-modal">
                <div className="edit-observation-header">
                  <h2 id="edit-observation-title">Edit observation</h2>
                    <button
                      type="button"
                      className="edit-observation-close"
                      onClick={closeEditObservationModal}
                      aria-label="Close edit form"
                    >
                      Close
                    </button>
                </div>

                <form
                  className="edit-observation-form"
                  onSubmit={submitEditObservation}
                >
                <label className="edit-observation-field">
                  <span>Species name</span>
                    <input
                      type="text"
                      value={editForm.species}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          species: e.target.value,
                        }))
                      }
                      placeholder="Enter species name"
                      required
                    />
                </label>

                <label className="edit-observation-field">
                  <span>Description</span>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Update your observation notes"
                    />
                </label>

              <div className="edit-observation-actions">
                <button
                  type="button"
                  className="edit-observation-cancel"
                  onClick={closeEditObservationModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-observation-save"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div
          className="edit-profile-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="edit-profile-modal">
            <div className="edit-profile-header">
              <h2 id="edit-profile-title">Edit profile</h2>
              <button
                type="button"
                className="edit-profile-close"
                onClick={closeEditProfileModal}
                aria-label="Close profile form"
              >
                Close
              </button>
              </div>

              <form className="edit-profile-form" onSubmit={submitEditProfile}>
                <label className="edit-profile-field">
                <span>Username</span>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                  required
                />
              </label>

              <label className="edit-profile-field">
                <span>Bio</span>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="Tell other users about your wildlife interests"
                />
              </label>

              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="edit-profile-cancel"
                  onClick={closeEditProfileModal}
                >
                  Cancel
                </button>
                <button type="submit" className="edit-profile-save">
                  Save profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {navigationTarget && (
        <NavigationPanel
          observation={navigationTarget}
          latitude={navigationTarget.location?.lat}
          longitude={navigationTarget.location?.lng}
          onClose={() => setNavigationTarget(null)}
        />
      )}
    </div>
  );
}
