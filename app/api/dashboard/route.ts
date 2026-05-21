// app/api/dashboard/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "http://nextlayer.soon.it/api/Dashboard/get.php",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // always fresh data
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: "Failed to fetch dashboard data",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: true,
      dashboard: data.dashboard,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}