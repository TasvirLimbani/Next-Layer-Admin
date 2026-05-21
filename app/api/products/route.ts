import { NextRequest, NextResponse } from 'next/server';

// GET - List all products
export async function GET() {
  try {
    const response = await fetch(
      'http://nextlayer.soon.it/api/Products/list.php',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: 'Failed to fetch products',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: true,
      products: data.products || data,
    });
  } catch (error) {
    console.error('Products List API Error:', error);

    return NextResponse.json(
      {
        status: false,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// POST - Add new product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the form data directly to the external API
    const response = await fetch(
      'http://nextlayer.soon.it/api/Products/add.php',
      {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: 'Failed to add product',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status || true,
      message: data.message || 'Product added successfully',
      product: data.product || data,
    });
  } catch (error) {
    console.error('Products Add API Error:', error);

    return NextResponse.json(
      {
        status: false,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
