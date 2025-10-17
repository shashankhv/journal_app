import { NextRequest, NextResponse } from "next/server";
import { getMonthCounts } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json(
      { error: "Missing year or month parameter" },
      { status: 400 }
    );
  }

  try {
    const counts = await getMonthCounts(parseInt(year), parseInt(month));
    return NextResponse.json(counts);
  } catch (error) {
    console.error("Failed to get month counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch month counts" },
      { status: 500 }
    );
  }
}
