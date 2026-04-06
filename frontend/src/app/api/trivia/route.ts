import { NextResponse } from "next/server";

const BACKEND_APP_URL = (process.env.BACKEND_APP_URL ?? "http://localhost:8000/").replace(/\/$/, "");

function getISTDateString(): string {
  // IST is UTC+5:30
  const now = new Date();
  const istOffset = 5 * 60 + 30; // minutes
  const istMs = now.getTime() + (istOffset - now.getTimezoneOffset()) * 60 * 1000;
  const istDate = new Date(istMs);
  const yyyy = istDate.getUTCFullYear();
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET() {
  const date = getISTDateString();
  try {
    const res = await fetch(`${BACKEND_APP_URL}/get-puzzle?date=${date}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend returned an error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 502 }
    );
  }
}
