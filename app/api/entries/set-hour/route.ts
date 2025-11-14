import { NextRequest, NextResponse } from "next/server";
import { setHourEntry } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, hour, text } = body;

    if (!date || hour === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const userId = getCurrentUserId();
    await setHourEntry(userId, date, hour, text || "");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set hour entry:", error);
    return NextResponse.json(
      { error: "Failed to set entry" },
      { status: 500 }
    );
  }
}
