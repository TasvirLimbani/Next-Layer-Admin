import { NextRequest, NextResponse } from 'next/server';

const BASE_URL =
  'http://nextlayer.soon.it/api/Orders';

// ORDER DETAILS
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${BASE_URL}/details.php?order_id=${id}`
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: false,
      message:
        'Failed to fetch order details',
    });
  }
}

// UPDATE ORDER STATUS
export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const response = await fetch(
      `${BASE_URL}/status.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          order_id: id,
          ...body,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: false,
      message:
        'Failed to update order status',
    });
  }
}

// DELETE ORDER
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    return NextResponse.json({
      status: true,
      message: `Order ${id} deleted`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      status: false,
      message: 'Delete failed',
    });
  }
}