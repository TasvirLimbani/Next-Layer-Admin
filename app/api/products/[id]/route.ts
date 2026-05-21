import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// PUT - Edit product
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const formData = await request.formData();

    // append ID
    formData.append('id', id);
    formData.append('product_id', id);

    console.log('Editing product ID:', id);

    const response = await fetch(
      'http://nextlayer.soon.it/api/Products/edit.php',
      {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      }
    );

    const data = await response.json();

    console.log('Edit API response:', data);

    if (!response.ok || data.status === false) {
      return NextResponse.json(
        {
          status: false,
          message: data.message || 'Failed to update product',
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: data.message || 'Product updated successfully',
      product: data.product || data,
    });
  } catch (error) {
    console.error('PUT Error:', error);

    return NextResponse.json(
      {
        status: false,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('DELETE PRODUCT ID:', id);

    const response = await fetch(
      'http://nextlayer.soon.it/api/Products/delete.php',
      {
        method: 'DELETE',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          id: Number(id),
        }),

        cache: 'no-store',
      }
    );

    const data = await response.json();

    console.log('DELETE RESPONSE:', data);

    if (!response.ok || data.status === false) {
      return NextResponse.json(
        {
          status: false,
          message:
            data.message ||
            'Failed to delete product',
        },
        {
          status: response.status || 500,
        }
      );
    }

    return NextResponse.json({
      status: true,
      message:
        data.message ||
        'Product deleted successfully',
    });
  } catch (error) {
    console.error(
      'DELETE API ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message: 'Internal Server Error',
      },
      {
        status: 500,
      }
    );
  }
}