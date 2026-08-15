import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireMember } from "@/lib/verify-firebase-token";

/**
 * Media uploads, stored in Vercel Blob.
 *
 * Replaces the Firebase Cloud Storage path, which failed with
 * `storage/unauthorized` because publishing Storage rules requires either the
 * Firebase CLI or Console access. Blob needs neither — the store is configured
 * in the Vercel dashboard and the token arrives as an environment variable.
 *
 * The caller is authenticated with their Firebase ID token, verified here
 * against Google's public certificates, and every file is written under a
 * prefix derived from the verified uid — so a member cannot write into
 * another member's namespace even by manipulating the request.
 */

export const runtime = "nodejs";
// Uploads must not be cached or statically optimised.
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 10;
const MAX_REQUEST_BYTES = MAX_BYTES * MAX_FILES + 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "application/pdf",
  "application/zip",
]);

function kindOf(type: string) {
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("image/")) return "image";
  return "file";
}

function safeName(name: string) {
  return (name || "upload").replace(/[^\w.\-]+/g, "_").slice(-80);
}

function displayName(name: string) {
  return (name || "upload").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 160) || "upload";
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

async function verifiedContentType(file: File): Promise<string | null> {
  const declared = (file.type || "").toLowerCase();
  if (!ALLOWED_TYPES.has(declared)) return null;

  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return declared === "image/jpeg" ? declared : null;
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return declared === "image/png" ? declared : null;
  }
  if (["GIF87a", "GIF89a"].includes(ascii(bytes, 0, 6))) {
    return declared === "image/gif" ? declared : null;
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return declared === "image/webp" ? declared : null;
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WAVE") {
    return declared === "audio/wav" || declared === "audio/x-wav" ? declared : null;
  }
  if (ascii(bytes, 0, 5) === "%PDF-") return declared === "application/pdf" ? declared : null;
  if (
    startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(bytes, [0x50, 0x4b, 0x07, 0x08])
  ) {
    return declared === "application/zip" ? declared : null;
  }
  if (ascii(bytes, 0, 4) === "OggS") {
    return declared === "audio/ogg" || declared === "video/ogg" ? declared : null;
  }
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
    return declared === "audio/webm" || declared === "video/webm" ? declared : null;
  }
  if (ascii(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
    return declared === "audio/mpeg" || declared === "audio/aac" ? declared : null;
  }
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4).toLowerCase();
    if (["avif", "avis"].includes(brand)) return declared === "image/avif" ? declared : null;
    if (["heic", "heix", "hevc", "hevx", "heif", "mif1"].includes(brand)) {
      return declared === "image/heic" || declared === "image/heif" ? declared : null;
    }
    return ["video/mp4", "video/quicktime", "audio/mp4", "audio/x-m4a"].includes(declared)
      ? declared
      : null;
  }

  return null;
}

export async function POST(request: Request) {
  let member;
  try {
    member = await requireMember(request);
  } catch (error) {
    console.warn("[Faith In] Upload authentication rejected", error);
    return NextResponse.json(
      { success: false, data: "Your session could not be verified. Please log in again." },
      { status: 401 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { success: false, data: "File storage is not configured yet. Please try again shortly." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { success: false, data: "That upload is too large. Choose fewer or smaller files." },
      { status: 413 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, data: "That upload could not be read." }, { status: 400 });
  }

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (!files.length) {
    return NextResponse.json({ success: false, data: "Choose a file to upload." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { success: false, data: `You can upload up to ${MAX_FILES} files at once.` },
      { status: 400 },
    );
  }

  const checkedFiles: Array<{ file: File; contentType: string }> = [];
  for (const file of files) {
    if (file.size <= 0) {
      return NextResponse.json(
        { success: false, data: `"${displayName(file.name)}" is empty and cannot be uploaded.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          data: `"${displayName(file.name)}" is ${Math.ceil(file.size / 1048576)}MB. The limit is 25MB — please choose a smaller file.`,
        },
        { status: 413 },
      );
    }
    const contentType = await verifiedContentType(file);
    if (!contentType) {
      return NextResponse.json(
        {
          success: false,
          data: `"${displayName(file.name)}" is not a supported file type or its contents do not match its format.`,
        },
        { status: 415 },
      );
    }
    checkedFiles.push({ file, contentType });
  }

  const uploaded = [];
  for (const { file, contentType } of checkedFiles) {
    try {
      // addRandomSuffix keeps names unguessable and avoids collisions.
      const blob = await put(`faith-in/${member.uid}/${safeName(file.name)}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType,
      });

      uploaded.push({
        url: blob.url,
        local_url: blob.url,
        preview_url: blob.url,
        drive_url: "",
        type: kindOf(contentType),
        mime: contentType,
        name: displayName(file.name),
        size: file.size,
        path: blob.pathname,
      });
    } catch (error) {
      console.error("[Faith In] Blob upload failed:", error);
      return NextResponse.json(
        { success: false, data: "Upload failed. Please check your connection and try again." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ success: true, data: { items: uploaded } });
}
