import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const amount = url.searchParams.get("amount") || "5";

    const res = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&category=15&type=multiple`
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data.results);
  } catch (err: any) {
    console.error("Error in external-questions API route:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
