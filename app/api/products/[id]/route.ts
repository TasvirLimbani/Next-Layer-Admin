import { NextRequest, NextResponse } from 'next/server';
import { normalizeProductImages } from '@/lib/utils';

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

    // Log formData entries (filenames for File objects)
    try {
      const fdLog: any[] = [];
      for (const pair of formData.entries()) {
        const [key, val] = pair as [string, any];
        if (val && typeof val === 'object' && 'name' in val) {
          fdLog.push({ key, filename: (val as File).name });
        } else {
          fdLog.push({ key, value: String(val) });
        }
      }
      console.log('FormData being forwarded to edit.php:', fdLog);
    } catch (fdErr) {
      console.warn('Could not enumerate formData for logging', fdErr);
    }

    // If there are no File entries in formData, send as URLSearchParams
    let hasFiles = false;
    for (const pair of formData.entries()) {
      const [, val] = pair as [string, any];
      if (val && typeof val === 'object' && 'name' in val) {
        hasFiles = true;
        break;
      }
    }

    let response: Response;
    if (!hasFiles) {
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, String(value));
      }
      response = await fetch('http://nextlayer.soon.it/api/Products/edit.php', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        cache: 'no-store',
      });
    } else {
      response = await fetch('http://nextlayer.soon.it/api/Products/edit.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });
    }

    let data: any;
    const resText = await response.text();
    // Try to parse JSON even if upstream prepends/appends noise (e.g. "php {...}")
    try {
      data = JSON.parse(resText);
    } catch (parseErr) {
      const start = resText.indexOf('{');
      const end = resText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const sub = resText.slice(start, end + 1);
        try {
          data = JSON.parse(sub);
          console.log('Parsed JSON from wrapped upstream response');
        } catch (subErr) {
          console.error('Failed to parse extracted JSON from upstream response', subErr, 'original:', resText);
          return NextResponse.json(
            {
              status: false,
              message: `Upstream error: ${resText}`,
            },
            { status: response.status || 502 }
          );
        }
      } else {
        console.error('Edit API returned non-JSON response:', resText);
        return NextResponse.json(
          {
            status: false,
            message: `Upstream error: ${resText}`,
          },
          { status: response.status || 502 }
        );
      }
    }

    // Normalize image_urls when upstream returns it as a JSON string
    try {
      if (data && data.image_urls && typeof data.image_urls === 'string') {
        const trimmed = data.image_urls.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || trimmed.startsWith('{')) {
          try {
            data.image_urls = JSON.parse(trimmed);
          } catch (jsonErr) {
            console.warn('Could not parse image_urls JSON string:', jsonErr);
          }
        }
      }
    } catch (normErr) {
      console.warn('Error normalizing upstream response fields', normErr);
    }

    const product = data.product || data;
    const normalizedProduct = normalizeProductImages(product);

    console.log('Edit API response:', data);

    if (!response.ok || data.status === false) {
      return NextResponse.json(
        {
          status: false,
          message: data.message || `Failed to update product (${response.status})`,
          upstream: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: data.message || 'Product updated successfully',
      product: normalizedProduct,
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