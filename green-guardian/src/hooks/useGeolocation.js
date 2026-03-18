import { useState, useMemo, useCallback } from "react";

function hasGeolocationSupport() {
  return "geolocation" in navigator;
}

function createLocationSnapshot(position) {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  };
}

export default function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const geolocationOptions = useMemo(
    () => ({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    }),
    [options]
  );

  const startTracking = useCallback(() => {
    if (!hasGeolocationSupport()) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(createLocationSnapshot(position));
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      geolocationOptions
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [geolocationOptions]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!hasGeolocationSupport()) {
      setError("Geolocation is not supported by your browser");
      return Promise.reject(new Error("Geolocation not supported"));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = createLocationSnapshot(position);
          setLocation(loc);
          setError(null);
          resolve(loc);
        },
        (err) => {
          setError(err.message);
          reject(err);
        },
        geolocationOptions
      );
    });
  }, [geolocationOptions]);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}
