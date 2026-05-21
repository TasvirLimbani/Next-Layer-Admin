import { NextResponse } from 'next/server';

const API_URL =
  'http://nextlayer.soon.it/api/Users/list.php';

// GET USERS
export async function GET() {
  try {
    const response = await fetch(API_URL, {
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log('USERS API ERROR:', error);

    return NextResponse.json({
      status: false,
      message: 'Failed to fetch users',
    });
  }
}