import { NextRequest, NextResponse } from "next/server";
import { setManyEntries } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, entries } = body;

    if (!date || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const userId = getCurrentUserId();
    await setManyEntries(userId, date, entries);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set many entries:", error);
    return NextResponse.json(
      { error: "Failed to set entries" },
      { status: 500 }
    );
  }
}
