import { NextResponse } from "next/server";
import { getAllEntries } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const entries = await getAllEntries(userId);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to get all entries:", error);
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
