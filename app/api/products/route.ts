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
// POST - Add new product
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // =========================
    // DEBUG / FIX REQUIRED FIELDS
    // =========================

    console.log('Incoming FormData:');

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name);
      } else {
        console.log(key, value);
      }
    }

    // =========================
    // CATEGORY FIX
    // =========================

    let category = formData.get('category');

    // Convert null/undefined to empty string
    if (category === null || category === undefined) {
      category = '';
    }

    category = String(category).trim();

    /*
     * If category is missing but subcategory contains the selected
     * category, you can optionally use subcategory.
     *
     * REMOVE this fallback if category and subcategory are different
     * fields in your application.
     */
    if (!category) {
      const subcategory = formData.get('subcategory');

      if (subcategory) {
        category = String(subcategory).trim();
      }
    }

    if (!category) {
      return NextResponse.json(
        {
          status: false,
          message: 'Category required',
        },
        { status: 400 }
      );
    }

    // Make absolutely sure category is in FormData
    formData.set('category', category);

    console.log('FINAL CATEGORY:', formData.get('category'));

    // =========================
    // CHECK FILES
    // =========================

    let hasFiles = false;

    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        hasFiles = true;
        break;
      }
    }

    // =========================
    // FORWARD TO PHP API
    // =========================

    let response: Response;

    if (!hasFiles) {
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          continue;
        }

        params.append(key, String(value));
      }

      response = await fetch(
        'http://nextlayer.soon.it/api/Products/add.php',
        {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          cache: 'no-store',
        }
      );
    } else {
      response = await fetch(
        'http://nextlayer.soon.it/api/Products/add.php',
        {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        }
      );
    }

    // =========================
    // READ RESPONSE
    // =========================

    const text = await response.text();

    console.log('ADD PHP RESPONSE:', text);

    let data: any;

    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('Invalid JSON from add.php:', text);

      return NextResponse.json(
        {
          status: false,
          message: `Upstream error: ${text}`,
        },
        {
          status: response.status || 502,
        }
      );
    }

    // =========================
    // PHP ERROR
    // =========================

    if (!response.ok || data.status === false) {
      return NextResponse.json(
        {
          status: false,
          message: data.message || 'Failed to add product',
          upstream: data,
        },
        {
          status: response.status || 500,
        }
      );
    }

    // =========================
    // PRODUCT
    // =========================

    const product = data.product || data;

    const normalizedProduct =
      normalizeProductImages(product);

    return NextResponse.json({
      status: true,
      message:
        data.message || 'Product added successfully',
      product: normalizedProduct,
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