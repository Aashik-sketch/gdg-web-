import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "./firebase";

/**
 * Firestore access for server components and route handlers.
 *
 * The credential handling and app initialisation that used to live here now
 * lives in lib/firebase.js, shared with lib/auth.js.
 */
export const connect = async (): Promise<Firestore> => getFirestoreDb();

/**
 * Convert Firestore values into something `JSON.stringify`-able so they can
 * cross the server/client boundary: Timestamps and Dates become ISO strings.
 */
export const serializeFirestoreData = (value: any): any => {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreData(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        serializeFirestoreData(item),
      ]),
    );
  }

  return value;
};
