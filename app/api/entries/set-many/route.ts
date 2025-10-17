import { NextRequest, NextResponse } from "next/server";
import { setManyEntries } from "../../../../lib/db";

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

    await setManyEntries(date, entries);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to set many entries:", error);
    return NextResponse.json(
      { error: "Failed to set entries" },
      { status: 500 }
    );
  }
}
