import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

export const db = new Dexie("green_guardian_db");

db.version(1).stores({
  observations: "id, createdAt, updatedAt, userId, isPublic",
  keyValue: "key",
});

async function addPhoto(id, imgSrc) {
  if (!id || typeof imgSrc !== "string") {
    return null;
  }
  try {
    await db.photos.put({ id, imgSrc });
    console.log(`Photo ${imgSrc.length} bytes successfully added. Got id ${id}`);
    return id;
  } catch (error) {
    console.log(`Failed to add photo: ${error}`);
    return null;
  }
}

function GetPhotoSrc(id) {
  try {
    const img = useLiveQuery(() => {
      if (!id) return [];
      return db.photos.where("id").equals(id).toArray();
    }, [id]);

    if (Array.isArray(img) && img.length > 0) {
      return img[0].imgSrc;
    }
  } catch (error) {
    console.log(`Failed to get photo source: ${error}`);
  }

  return null;
}

db.version(2).stores({
  observations: "id, createdAt, updatedAt, userId, isPublic",
  keyValue: "key",
  photos: "id",
});

const dbReady = db.open().catch((error) => {
  console.error("Failed to open IndexedDB via Dexie:", error);
  return null;
});

async function getAllObservationsFromDb() {
  const observations = await db.observations.toArray();
  return observations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function replaceAllObservationsInDb(observations) {
  await db.transaction("rw", db.observations, async () => {
    await db.observations.clear();
    if (Array.isArray(observations) && observations.length > 0) {
      await db.observations.bulkPut(observations);
    }
  });
}

async function replaceAllPhotosInDb(observations) {
  const photos = Array.isArray(observations)
    ? observations
        .filter((observation) => observation?.id && typeof observation?.photo === "string")
        .map((observation) => ({ id: observation.id, imgSrc: observation.photo }))
    : [];

  await db.transaction("rw", db.photos, async () => {
    await db.photos.clear();
    if (photos.length > 0) {
      await db.photos.bulkPut(photos);
    }
  });
}

async function getUserFromDb() {
  const record = await db.keyValue.get("user");
  return record?.value ?? null;
}

async function setUserInDb(user) {
  await db.keyValue.put({ key: "user", value: user });
}

function useObservationsLiveQuery() {
  return useLiveQuery(() => getAllObservationsFromDb(), []);
}

export {
  addPhoto,
  GetPhotoSrc,
  dbReady,
  getAllObservationsFromDb,
  replaceAllObservationsInDb,
  replaceAllPhotosInDb,
  getUserFromDb,
  setUserInDb,
  useObservationsLiveQuery,
};
