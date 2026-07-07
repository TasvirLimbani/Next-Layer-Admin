import { NextRequest, NextResponse } from 'next/server';
import { normalizeProductImageUrls, normalizeProductImages } from '@/lib/utils';

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

    const rawProducts = Array.isArray(data.products)
      ? data.products
      : data.products
        ? [data.products]
        : Array.isArray(data)
          ? data
          : [data];

    const products = rawProducts.map((product) => {
      const normalizedProduct = normalizeProductImages(product);

      return {
        ...normalizedProduct,
        image_urls: normalizeProductImageUrls(normalizedProduct),
      };
    });

    return NextResponse.json({
      status: true,
      products: Array.isArray(data.products) ? products : products[0],
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

    // Log formData entries for debugging
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
      console.log('FormData being forwarded to add.php:', fdLog);
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
      response = await fetch('http://nextlayer.soon.it/api/Products/add.php', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        cache: 'no-store',
      });
    } else {
      // Forward as multipart
      response = await fetch('http://nextlayer.soon.it/api/Products/add.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      });
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const sub = text.slice(start, end + 1);
        try {
          data = JSON.parse(sub);
          console.log('Parsed JSON from wrapped add.php response');
        } catch (subErr) {
          console.error('Add API returned non-JSON response:', text);
          return NextResponse.json(
            { status: false, message: `Upstream error: ${text}` },
            { status: response.status || 502 }
          );
        }
      } else {
        console.error('Add API returned non-JSON response:', text);
        return NextResponse.json(
          { status: false, message: `Upstream error: ${text}` },
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
            console.warn('Could not parse image_urls JSON string from add.php:', jsonErr);
          }
        }
      }
    } catch (normErr) {
      console.warn('Error normalizing add.php response fields', normErr);
    }

    const product = data.product || data;
    const normalizedProduct = normalizeProductImages(product);

    if (!response.ok || data.status === false) {
      return NextResponse.json(
        { status: false, message: data.message || 'Failed to add product', upstream: data },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ status: data.status || true, message: data.message || 'Product added successfully', product: normalizedProduct });
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
