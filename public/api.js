// public/api.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Automatically pulls config when hosted on Firebase Hosting
// (Or replace these two lines with your static firebaseConfig object)
const configRes = await fetch("/__/firebase/init.json");
const firebaseConfig = await configRes.json();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to query the newest documents from a Firestore collection
async function fetchLatestDocs(collectionName, maxCount = 20) {
  const q = query(
    collection(db, collectionName),
    orderBy("timestamp", "desc"),
    limit(maxCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    // Convert Firestore Timestamp objects into standard ISO strings for app.js
    if (data.timestamp?.toDate) {
      data.timestamp = data.timestamp.toDate().toISOString();
    }
    if (data.created_at?.toDate) {
      data.created_at = data.created_at.toDate().toISOString();
    }
    return { id: doc.id, ...data };
  });
}

window.gardenGuardApi = {
  // 1. Replaces backend /health check by verifying Firestore read access
  async health() {
    const q = query(collection(db, "readings"), limit(1));
    await getDocs(q);
    return { status: "ok" };
  },

  // 2. Matches app.js: latest.soil_moisture || latest.soilMoisture
  async latestReadings() {
    const docs = await fetchLatestDocs("readings", 1);
    const latestDoc = docs[0] || null;
    return {
      soil_moisture: latestDoc,
    };
  },

  // 3. Matches app.js: returns an array of motion records
  async motion() {
    return await fetchLatestDocs("motion_events", 50);
  },

  // 4. Matches app.js: returns an array of timeline events
  async events() {
    return await fetchLatestDocs("events", 10);
  },

  // 5. Used by setup.js to save camera, motion, or sensor configurations
  async saveDeviceSetup(setupType, payload) {
    const docRef = await addDoc(collection(db, "devices"), {
      type: setupType,
      ...payload,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  },
};