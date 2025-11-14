import { NextResponse } from "next/server";
import { getAllEntries } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export async function GET() {
  try {
    const userId = getCurrentUserId();
    const entries = await getAllEntries(userId);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to get all entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
