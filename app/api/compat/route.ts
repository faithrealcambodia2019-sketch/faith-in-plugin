import { NextResponse } from "next/server";

const response = {
  success: false,
  data: "This feature is being migrated to the native Faith In data service.",
};

export async function POST() {
  return NextResponse.json(response, {
    status: 501,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  return NextResponse.json(response, {
    status: 501,
    headers: { "Cache-Control": "no-store" },
  });
}
