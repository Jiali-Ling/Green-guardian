import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

export default function usePhotoSrc(id) {
  const photo = useLiveQuery(async () => {
    if (!id) return null;
    return db.photos.get(id);
  }, [id]);

  return photo?.imgSrc ?? null;
}