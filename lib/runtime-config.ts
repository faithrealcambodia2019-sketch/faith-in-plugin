export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

// Firebase web identifiers are intentionally public. Authorization is enforced
// by Firebase Authentication, App Check, and the Firestore/Storage rules.
export const firebasePublicConfig: FirebasePublicConfig = Object.freeze({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDJNCX00QsByyUG_1293fzjXJ-LhEbA-a4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "faith-app-98a5f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "faith-app-98a5f",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "faith-app-98a5f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "218141432536",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:218141432536:web:6aedbcc4477093135315ad",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RP7DL9K5BH",
});

export const siteConfig = Object.freeze({
  name: "Faith In",
  domain: "faithin.co",
  origin: "https://faithin.co",
});

export const browserRuntimeConfig = Object.freeze({
  // Compatibility endpoint for UI features that have not yet moved to a
  // native Firestore repository. It fails closed rather than reaching PHP.
  ajax_url: "/api/compat",
  nonce: "firebase",
  rest_root: "/api/resources",
  rest_faithin_root: "/api/community",
  rest_nonce: "firebase",
  asset_base_url: "/",
  auth: {
    mode: "firebase",
    backend_mode: "firebase",
    google_client_id: "",
    allowed_domain: siteConfig.domain,
    magic_link_enabled: false,
    firebase_config: firebasePublicConfig,
    app_check_site_key: process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY || "",
    site_domain: siteConfig.domain,
    site_origin: siteConfig.origin,
    register_url: "#profile",
    is_logged_in: false,
    current_user: null,
    verification_status: null,
  },
});
