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

    const userId = await getCurrentUserId();
    console.log("ashdjkf;jhasdjkf,", userId);
    await setManyEntries(userId, date, entries);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set many entries:", error);
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to set entries" },
      { status: 500 }
    );
  }
}
