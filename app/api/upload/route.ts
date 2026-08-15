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

const ALLOWED = [
  /^image\//,
  /^video\/(mp4|quicktime|webm|ogg)$/,
  /^audio\//,
  /^application\/pdf$/,
];

function isAllowed(type: string) {
  return ALLOWED.some((pattern) => pattern.test(type));
}

function kindOf(type: string) {
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("image/")) return "image";
  return "file";
}

function safeName(name: string) {
  return (name || "upload").replace(/[^\w.\-]+/g, "_").slice(-80);
}

export async function POST(request: Request) {
  let member;
  try {
    member = await requireMember(request);
  } catch (error) {
    return NextResponse.json(
      { success: false, data: error instanceof Error ? error.message : "Please log in again." },
      { status: 401 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { success: false, data: "File storage is not configured yet. Please try again shortly." },
      { status: 503 },
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

  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          data: `"${file.name}" is ${Math.ceil(file.size / 1048576)}MB. The limit is 25MB — please choose a smaller file.`,
        },
        { status: 413 },
      );
    }
    if (!isAllowed(file.type || "")) {
      return NextResponse.json(
        { success: false, data: `"${file.name}" is not a supported file type.` },
        { status: 415 },
      );
    }

    try {
      // addRandomSuffix keeps names unguessable and avoids collisions.
      const blob = await put(`faith-in/${member.uid}/${safeName(file.name)}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type || "application/octet-stream",
      });

      uploaded.push({
        url: blob.url,
        local_url: blob.url,
        preview_url: blob.url,
        drive_url: "",
        type: kindOf(file.type || ""),
        mime: file.type || "",
        name: file.name || "",
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
