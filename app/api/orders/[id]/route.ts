// import { NextRequest, NextResponse } from 'next/server';

// const BASE_URL =
//   'http://nextlayer.soon.it/api/Orders';

// // ORDER DETAILS
// export async function GET(
//   req: NextRequest,
//   {
//     params,
//   }: {
//     params: Promise<{ id: string }>;
//   }
// ) {
//   try {
//     const { id } = await params;

//     const response = await fetch(
//       `${BASE_URL}/details.php?order_id=${id}`
//     );

//     const data = await response.json();

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({
//       status: false,
//       message:
//         'Failed to fetch order details',
//     });
//   }
// }

// // UPDATE ORDER STATUS
// export async function PUT(
//   req: NextRequest,
//   {
//     params,
//   }: {
//     params: Promise<{ id: string }>;
//   }
// ) {
//   try {
//     const { id } = await params;

//     const body = await req.json();

//     const response = await fetch(
//       `${BASE_URL}/status.php`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type':
//             'application/json',
//         },
//         body: JSON.stringify({
//           order_id: id,
//           ...body,
//         }),
//       }
//     );

//     const data = await response.json();

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({
//       status: false,
//       message:
//         'Failed to update order status',
//     });
//   }
// }

// // DELETE ORDER
// export async function DELETE(
//   req: NextRequest,
//   {
//     params,
//   }: {
//     params: Promise<{ id: string }>;
//   }
// ) {
//   try {
//     const { id } = await params;

//     return NextResponse.json({
//       status: true,
//       message: `Order ${id} deleted`,
//     });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({
//       status: false,
//       message: 'Delete failed',
//     });
//   }
// }



import {
  NextRequest,
  NextResponse,
} from 'next/server';

const BASE_URL =
  'http://nextlayer.soon.it/api/Orders';

const DETAILS_API =
  `${BASE_URL}/details.php`;

const STATUS_API =
  `${BASE_URL}/status.php`;


// =====================================================
// GET - ORDER DETAILS
// =====================================================
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message:
            'Order ID is required',
        },
        {
          status: 400,
        }
      );
    }

    const apiUrl =
      `${DETAILS_API}?order_id=${encodeURIComponent(
        id
      )}`;

    console.log(
      'FETCH ORDER DETAILS:',
      apiUrl
    );

    const response =
      await fetch(apiUrl, {
        method: 'GET',
        cache: 'no-store',
      });

    const text =
      await response.text();

    console.log(
      'ORDER DETAILS STATUS:',
      response.status
    );

    console.log(
      'ORDER DETAILS RESPONSE:',
      text
    );

    let data: any;

    try {
      data =
        JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message:
            'Order details API returned invalid JSON',
          php_response: text,
        },
        {
          status: 502,
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            data?.message ||
            'Failed to fetch order details',
          data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(
      data,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      'GET ORDER DETAILS ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch order details',
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// PUT - UPDATE ORDER STATUS
// =====================================================
export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message:
            'Order ID is required',
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    console.log(
      'UPDATE ORDER STATUS:',
      {
        order_id: id,
        ...body,
      }
    );

    const response =
      await fetch(STATUS_API, {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          order_id: id,
          ...body,
        }),

        cache: 'no-store',
      });

    const text =
      await response.text();

    console.log(
      'UPDATE STATUS HTTP:',
      response.status
    );

    console.log(
      'UPDATE STATUS RESPONSE:',
      text
    );

    let data: any;

    try {
      data =
        JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message:
            'Status API returned invalid JSON',
          php_response: text,
        },
        {
          status: 502,
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            data?.message ||
            'Failed to update order status',
          data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(
      data,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      'UPDATE ORDER STATUS ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update order status',
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// DELETE - ORDER
// =====================================================
//
// IMPORTANT:
// Your current PHP API does not show a delete.php endpoint.
// Therefore we should NOT pretend that deletion happened.
//
// Until you have a real PHP delete endpoint, this returns
// a clear message instead of falsely reporting success.
// =====================================================
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message:
            'Order ID is required',
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        status: false,
        message:
          'Order deletion API is not configured',
      },
      {
        status: 501,
      }
    );
  } catch (error) {
    console.error(
      'DELETE ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          'Delete failed',
      },
      {
        status: 500,
      }
    );
  }
}