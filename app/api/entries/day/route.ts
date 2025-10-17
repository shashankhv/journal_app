import { NextRequest, NextResponse } from "next/server";
import { getDay } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  try {
    const entries = await getDay(date);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to get day entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries for date" },
      { status: 500 }
    );
  }
}
