import Dexie from "dexie";

export const db = new Dexie("green_guardian_db");

const OBSERVATIONS_SCHEMA = "id, createdAt, updatedAt, userId, isPublic";
const KEY_VALUE_SCHEMA = "key";
const PHOTOS_SCHEMA = "id";

function isValidPhotoPayload(id, imgSrc) {
  return Boolean(id) && typeof imgSrc === "string";
}

db.version(1).stores({
  observations: OBSERVATIONS_SCHEMA,
  keyValue: KEY_VALUE_SCHEMA,
});

db.version(2).stores({
  observations: OBSERVATIONS_SCHEMA,
  keyValue: KEY_VALUE_SCHEMA,
  photos: PHOTOS_SCHEMA,
});

export const dbReady = db.open().catch((error) => {
  console.error("Failed to open IndexedDB via Dexie:", error);
  return null;
});

export async function addPhoto(id, imgSrc) {
  if (!isValidPhotoPayload(id, imgSrc)) {
    return null;
  }

  try {
    await db.photos.put({ id, imgSrc });
    console.log(`Photo ${imgSrc.length} bytes successfully added. Got id ${id}`);
    return id;
  } catch (error) {
    console.error("Failed to add photo:", error);
    return null;
  }
}

export async function getPhotoById(id) {
  if (!id) return null;

  try {
    return await db.photos.get(id);
  } catch (error) {
    console.error("Failed to get photo by id:", error);
    return null;
  }
}

export async function getAllObservationsFromDb() {
  const observations = await db.observations.toArray();
  return observations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function replaceAllObservationsInDb(observations) {
  await db.transaction("rw", db.observations, async () => {
    await db.observations.clear();
    if (Array.isArray(observations) && observations.length > 0) {
      await db.observations.bulkPut(observations);
    }
  });
}

export async function replaceAllPhotosInDb(observations) {
  const photoRows = Array.isArray(observations)
    ? observations
        .filter((observation) => observation?.id && typeof observation?.photo === "string")
        .map((observation) => ({ id: observation.id, imgSrc: observation.photo }))
    : [];

  await db.transaction("rw", db.photos, async () => {
    await db.photos.clear();
    if (photoRows.length > 0) {
      await db.photos.bulkPut(photoRows);
    }
  });
}

export async function getUserFromDb() {
  const record = await db.keyValue.get("user");
  return record?.value ?? null;
}

export async function setUserInDb(user) {
  await db.keyValue.put({ key: "user", value: user });
}
