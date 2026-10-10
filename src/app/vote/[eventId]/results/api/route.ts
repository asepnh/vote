import { NextResponse } from "next/server";
import { getResults } from "@/app/actions/vote";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const results = await getResults(eventId);
  return NextResponse.json({ results });
}
