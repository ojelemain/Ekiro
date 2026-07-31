"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MicroZone {
  id: string;
  center: Coordinates;
  radiusMeters: number;
  isLocked: boolean;
  lockedBy: string | null;
  lockedAt: number | null;
  lockExpiresAt: number | null;
}

const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ZONE_RADIUS_METERS = 10;

// Approximate metres-per-degree at Ekiti State's latitude (~7.6N)
const METERS_PER_DEGREE_LAT = 111_320;
const METERS_PER_DEGREE_LNG = 110_250;

function distanceMeters(a: Coordinates, b: Coordinates): number {
  const dLat = (a.lat - b.lat) * METERS_PER_DEGREE_LAT;
  const dLng = (a.lng - b.lng) * METERS_PER_DEGREE_LNG;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function makeZoneId(coords: Coordinates): string {
  return `zone-${coords.lat.toFixed(5)}-${coords.lng.toFixed(5)}`;
}

interface LocationContextValue {
  currentPosition: Coordinates;
  simulateMovement: (delta: Partial<Coordinates>) => void;
  zones: MicroZone[];
  registerZone: (center: Coordinates) => MicroZone;
  claimZone: (zoneId: string, userId: string) => { success: boolean; reason?: string };
  releaseZone: (zoneId: string) => void;
  isWithinZone: (zoneId: string) => boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

// Default: Ado-Ekiti city centre approximation
const DEFAULT_POSITION: Coordinates = { lat: 7.6212, lng: 5.2211 };

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentPosition, setCurrentPosition] = useState<Coordinates>(DEFAULT_POSITION);
  const [zones, setZones] = useState<MicroZone[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  const simulateMovement = useCallback((delta: Partial<Coordinates>) => {
    setCurrentPosition((prev) => ({
      lat: prev.lat + (delta.lat ?? 0),
      lng: prev.lng + (delta.lng ?? 0),
    }));
  }, []);

  const registerZone = useCallback((center: Coordinates): MicroZone => {
    const id = makeZoneId(center);
    let zone: MicroZone | undefined;

    setZones((prev) => {
      const existing = prev.find((z) => z.id === id);
      if (existing) {
        zone = existing;
        return prev;
      }
      const created: MicroZone = {
        id,
        center,
        radiusMeters: ZONE_RADIUS_METERS,
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      };
      zone = created;
      return [...prev, created];
    });

    return zone as MicroZone;
  }, []);

  const claimZone = useCallback((zoneId: string, userId: string): { success: boolean; reason?: string } => {
    let result: { success: boolean; reason?: string } = { success: false };

    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;

        const now = Date.now();
        const stillLocked = z.isLocked && z.lockExpiresAt !== null && z.lockExpiresAt > now;

        if (stillLocked && z.lockedBy !== userId) {
          result = { success: false, reason: "Zone is locked by another tasker for the next 30 minutes." };
          return z;
        }

        const withinRange = distanceMeters(currentPosition, z.center) <= z.radiusMeters + 5;
        if (!withinRange) {
          result = { success: false, reason: "You must be within the 10-metre zone to claim it." };
          return z;
        }

        const lockedAt = now;
        const lockExpiresAt = now + LOCK_DURATION_MS;

        if (timersRef.current[zoneId]) clearTimeout(timersRef.current[zoneId]);
        timersRef.current[zoneId] = setTimeout(() => {
          setZones((current) =>
            current.map((cz) =>
              cz.id === zoneId
                ? { ...cz, isLocked: false, lockedBy: null, lockedAt: null, lockExpiresAt: null }
                : cz
            )
          );
        }, LOCK_DURATION_MS);

        result = { success: true };
        return { ...z, isLocked: true, lockedBy: userId, lockedAt, lockExpiresAt };
      })
    );

    return result;
  }, [currentPosition]);

  const releaseZone = useCallback((zoneId: string) => {
    if (timersRef.current[zoneId]) {
      clearTimeout(timersRef.current[zoneId]);
      delete timersRef.current[zoneId];
    }
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId ? { ...z, isLocked: false, lockedBy: null, lockedAt: null, lockExpiresAt: null } : z
      )
    );
  }, []);

  const isWithinZone = useCallback(
    (zoneId: string): boolean => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return false;
      return distanceMeters(currentPosition, zone.center) <= zone.radiusMeters + 5;
    },
    [zones, currentPosition]
  );

  const value = useMemo<LocationContextValue>(
    () => ({
      currentPosition,
      simulateMovement,
      zones,
      registerZone,
      claimZone,
      releaseZone,
      isWithinZone,
    }),
    [currentPosition, simulateMovement, zones, registerZone, claimZone, releaseZone, isWithinZone]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}
