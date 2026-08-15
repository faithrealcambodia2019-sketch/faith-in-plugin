import { jwtVerify, decodeProtectedHeader, importX509, type JWTPayload } from "jose";
import { firebasePublicConfig } from "@/lib/runtime-config";

/**
 * Verifies a Firebase Authentication ID token on the server.
 *
 * Deliberately does NOT use firebase-admin. The Admin SDK requires a service
 * account private key, which would mean storing a long-lived secret in the
 * deployment. Firebase ID tokens are ordinary RS256 JWTs signed with Google's
 * *public* certificates, so they can be verified with public data only.
 *
 * Checks performed, per Firebase's documented requirements:
 *   - RS256 signature against Google's current signing certificates
 *   - issuer  === https://securetoken.google.com/<projectId>
 *   - audience === <projectId>
 *   - exp in the future, iat in the past
 *   - sub (the uid) present and non-empty
 */

const PROJECT_ID = firebasePublicConfig.projectId;
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const MAX_TOKEN_LENGTH = 16_384;
const MAX_CERT_CACHE_SECONDS = 86_400;

export type VerifiedUser = {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string;
};

/**
 * Google publishes the signing certificates as X.509 PEMs keyed by `kid`,
 * not as a JWKS, so the standard createRemoteJWKSet helper cannot be pointed
 * at it directly. Cache the parsed keys and respect the endpoint's max-age.
 */
let certCache: { keys: Record<string, string>; expiresAt: number } | null = null;

async function getSigningCertificates(): Promise<Record<string, string>> {
  if (certCache && certCache.expiresAt > Date.now()) return certCache.keys;

  const response = await fetch(CERT_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not fetch Google signing certificates (${response.status}).`);
  }
  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Google returned an invalid signing certificate response.");
  }

  const keys = Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" &&
        typeof entry[1] === "string" &&
        entry[1].includes("BEGIN CERTIFICATE"),
    ),
  );
  if (!Object.keys(keys).length) {
    throw new Error("Google returned no usable signing certificates.");
  }

  // Honour Cache-Control so we are not refetching on every request.
  const maxAge = Math.min(
    Math.max(
      Number(/max-age=(\d+)/.exec(response.headers.get("cache-control") || "")?.[1] || 3600),
      60,
    ),
    MAX_CERT_CACHE_SECONDS,
  );
  certCache = { keys, expiresAt: Date.now() + maxAge * 1000 };
  return keys;
}

export async function verifyFirebaseToken(idToken: string): Promise<VerifiedUser> {
  if (!idToken) throw new Error("Missing authentication token.");
  if (idToken.length > MAX_TOKEN_LENGTH) {
    throw new Error("Your session is not valid. Please log in again.");
  }

  // decodeProtectedHeader throws library-specific text on a malformed token
  // ("Invalid Token or Protected Header formatting"), which should not reach
  // a member. Normalise every failure here to the same neutral message.
  let header;
  try {
    header = decodeProtectedHeader(idToken);
  } catch {
    throw new Error("Your session is not valid. Please log in again.");
  }
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Your session is not valid. Please log in again.");
  }

  const certificates = await getSigningCertificates();
  const pem = certificates[header.kid];
  if (!pem) {
    // The key may have rotated since we cached; refetch once before failing.
    certCache = null;
    const fresh = await getSigningCertificates();
    if (!fresh[header.kid]) throw new Error("Your session is not valid. Please log in again.");
    return verifyWithPem(idToken, fresh[header.kid]);
  }

  return verifyWithPem(idToken, pem);
}

async function verifyWithPem(idToken: string, pem: string): Promise<VerifiedUser> {
  const key = await importX509(pem, "RS256");

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(idToken, key, {
      issuer: ISSUER,
      audience: PROJECT_ID,
      algorithms: ["RS256"],
      clockTolerance: 60,
    }));
  } catch {
    // Deliberately opaque: never echo JWT internals back to the caller.
    throw new Error("Your session has expired. Please log in again.");
  }

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) throw new Error("Your session is not valid. Please log in again.");

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.iat !== "number" || payload.iat > now + 60) {
    throw new Error("Your session is not valid. Please log in again.");
  }
  if (typeof payload.auth_time === "number" && payload.auth_time > now + 60) {
    throw new Error("Your session is not valid. Please log in again.");
  }

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : "",
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : "",
    picture: typeof payload.picture === "string" ? payload.picture : "",
  };
}

/** Pulls the bearer token out of an Authorization header. */
export function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : "";
}

/** Verifies the caller, or throws with a message safe to show a member. */
export async function requireMember(request: Request): Promise<VerifiedUser> {
  return verifyFirebaseToken(bearerToken(request));
}
