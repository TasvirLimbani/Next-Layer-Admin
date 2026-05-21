import { NextRequest, NextResponse } from 'next/server';

const BASE_URL =
  'http://nextlayer.soon.it/api/Orders';

// GET ALL ORDERS / ORDER HISTORY
export async function GET(req: NextRequest) {
  try {
    const user_id =
      req.nextUrl.searchParams.get('user_id');

    let apiUrl = '';

    // ORDER HISTORY
    if (user_id) {
      apiUrl =
        `${BASE_URL}/history.php?user_id=${user_id}`;
    } else {
      apiUrl =
        `${BASE_URL}/history.php`;
    }

    const response = await fetch(apiUrl);

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: false,
      message: 'Failed to fetch orders',
    });
  }
}

// ADD ORDER
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${BASE_URL}/add.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: false,
      message: 'Failed to add order',
    });
  }
}