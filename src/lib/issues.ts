import { db, storage, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  updateDoc,
  getDocs,
  limit,
  arrayUnion,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Issue, Location, IssueStatus } from "@/types/issue";
import { demoIssues } from "@/data/demoIssues";


/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const ISSUES_COLLECTION = "issues";
const supportsFirestore = Boolean(db);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AddIssuePayload = {
  title: string;
  description: string;
  category: string;
  location: Location;
  mediaFiles?: File[];
  videoFile?: File | null;
};

type MediaEntry = {
  url: string;
  type: "image" | "video";
  uploadedAt: Timestamp;
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

const uploadMedia = async (
  issueId: string,
  file: File,
  type: "image" | "video",
  index = 0
): Promise<MediaEntry> => {
  const path = `issues/${issueId}/media/${Date.now()}-${index}-${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    type,
    uploadedAt: Timestamp.now(), // ✅ allowed inside arrays
  };
};

// Upload media files and append to `resolutionProof` on the issue document
export const addResolutionProof = async (
  issueId: string,
  images: File[] = [],
  video: File | null = null
) => {
  if (!supportsFirestore) return;

  const docRef = doc(db, ISSUES_COLLECTION, issueId);
  const entries: MediaEntry[] = [];

  for (let i = 0; i < images.length; i++) {
    const e = await uploadMedia(issueId, images[i], "image", i);
    entries.push(e);
  }

  if (video) {
    const e = await uploadMedia(issueId, video, "video", 0);
    entries.push(e);
  }

  if (entries.length) {
    await updateDoc(docRef, {
      resolutionProof: arrayUnion(...entries),
      updatedAt: serverTimestamp(),
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                ADD ISSUE                                   */
/* -------------------------------------------------------------------------- */

export const addIssue = async (payload: AddIssuePayload): Promise<string> => {
  if (!supportsFirestore) {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Check VITE_FIREBASE_* env vars.");
  }

  /* 1️⃣ Create base issue document */
  const docRef = await addDoc(collection(db, ISSUES_COLLECTION), {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    location: payload.location,
    status: "Reported",
    media: [],
    statusHistory: [
      {
        from: null,
        to: "Reported",
        changedAt: Timestamp.now(), // ✅ NOT serverTimestamp
      },
    ],
    createdAt: serverTimestamp(), // ✅ top-level OK
    updatedAt: serverTimestamp(), // ✅ top-level OK
  });

  const issueId = docRef.id;
  const mediaEntries: MediaEntry[] = [];

  /* 2️⃣ Upload images */
  if (payload.mediaFiles?.length) {
    for (let i = 0; i < payload.mediaFiles.length; i++) {
      const entry = await uploadMedia(issueId, payload.mediaFiles[i], "image", i);
      mediaEntries.push(entry);
    }
  }

  /* 3️⃣ Upload video */
  if (payload.videoFile) {
    const entry = await uploadMedia(issueId, payload.videoFile, "video");
    mediaEntries.push(entry);
  }

  /* 4️⃣ Append media in ONE update */
  if (mediaEntries.length) {
    await updateDoc(docRef, {
      media: arrayUnion(...mediaEntries),
      updatedAt: serverTimestamp(),
    });
  }

  return issueId;
};

/* -------------------------------------------------------------------------- */
/*                              READ / LISTEN                                 */
/* -------------------------------------------------------------------------- */

export const listenToIssues = (onChange: (issues: Issue[]) => void) => {
  if (!supportsFirestore) {
    onChange(demoIssues);
    return () => {};
  }

  const q = query(
    collection(db, ISSUES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Issue),
    }));
    onChange(issues);
  });
};

export const getIssue = async (id: string): Promise<Issue | undefined> => {
  if (!supportsFirestore) {
    return demoIssues.find((i) => i.id === id);
  }

  const snap = await getDoc(doc(db, ISSUES_COLLECTION, id));
  if (!snap.exists()) return undefined;

  return { id: snap.id, ...(snap.data() as Issue) };
};

/* -------------------------------------------------------------------------- */
/*                               UPDATE STATUS                                */
/* -------------------------------------------------------------------------- */

export const updateIssueStatus = async (
  id: string,
  status: IssueStatus,
  changedBy?: string
) => {
  if (!supportsFirestore) return;

  const ref = doc(db, ISSUES_COLLECTION, id);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({
      from: null,
      to: status,
      changedAt: Timestamp.now(), // ✅ allowed
      changedBy: changedBy ?? null,
    }),
  });
};

export const assignResolver = async (
  id: string,
  resolver: { name: string; department?: string; contact?: string }
) => {
  if (!supportsFirestore) return;
  const refDoc = doc(db, ISSUES_COLLECTION, id);
  await updateDoc(refDoc, {
    resolver: resolver || null,
    updatedAt: serverTimestamp(),
  });
};

/* -------------------------------------------------------------------------- */
/*                                 DELETE                                     */
/* -------------------------------------------------------------------------- */

export const deleteIssue = async (id: string) => {
  if (!supportsFirestore) return;
  await deleteDoc(doc(db, ISSUES_COLLECTION, id));
};

/* -------------------------------------------------------------------------- */
/*                           FIRESTORE HEALTH CHECK                            */
/* -------------------------------------------------------------------------- */

export const testFirestoreConnection = async () => {
  if (!supportsFirestore) throw new Error("Firestore not initialized");
  if (!isFirebaseConfigured()) throw new Error("Firebase not configured");

  const q = query(collection(db, ISSUES_COLLECTION), limit(1));
  const snap = await getDocs(q);
  return snap.size;
};


export const toDateSafe = (
  ts?: Timestamp | null
): Date | null => {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  return null;
};
