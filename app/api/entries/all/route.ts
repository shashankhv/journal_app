import { NextResponse } from "next/server";
import { getAllEntries } from "../../../../lib/db";

export async function GET() {
  try {
    const entries = await getAllEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to get all entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
