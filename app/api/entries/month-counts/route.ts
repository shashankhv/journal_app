import { NextRequest, NextResponse } from "next/server";
import { getMonthCounts } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";

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
    const userId = await getCurrentUserId();
    const counts = await getMonthCounts(userId, parseInt(year), parseInt(month));
    return NextResponse.json(counts);
  } catch (error) {
    console.error("Failed to get month counts:", error);
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch month counts" },
      { status: 500 }
    );
  }
}
