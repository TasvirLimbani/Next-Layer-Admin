// import { NextRequest, NextResponse } from 'next/server';

// const BASE_URL =
//   'http://nextlayer.soon.it/api/Orders';

// // GET ALL ORDERS / ORDER HISTORY
// export async function GET(req: NextRequest) {
//   try {
//     const user_id =
//       req.nextUrl.searchParams.get('user_id');

//     let apiUrl = '';

//     // ORDER HISTORY
//     if (user_id) {
//       apiUrl =
//         `${BASE_URL}/history.php?user_id=${user_id}`;
//     } else {
//       apiUrl =
//         `${BASE_URL}/history.php`;
//     }

//     const response = await fetch(apiUrl);

//     const data = await response.json();

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({
//       status: false,
//       message: 'Failed to fetch orders',
//     });
//   }
// }

// // ADD ORDER
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const response = await fetch(
//       `${BASE_URL}/add.php`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type':
//             'application/json',
//         },
//         body: JSON.stringify(body),
//       }
//     );

//     const data = await response.json();

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json({
//       status: false,
//       message: 'Failed to add order',
//     });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://nextlayer.soon.it/api/Orders';

const HISTORY_API = `${BASE_URL}/history.php`;
const ADD_API = `${BASE_URL}/add.php`;


// ==========================================
// GET ORDERS
// ==========================================

export async function GET(req: NextRequest) {
  try {
    const userId =
      req.nextUrl.searchParams.get('user_id');

    let apiUrl = HISTORY_API;

    // If user_id exists:
    // return only that user's orders.
    //
    // If user_id does NOT exist:
    // return ALL orders.
    if (userId) {
      apiUrl =
        `${HISTORY_API}?user_id=${encodeURIComponent(userId)}`;
    }

    console.log('=================================');
    console.log('FETCH ORDERS');
    console.log('USER ID:', userId);
    console.log('API URL:', apiUrl);
    console.log('=================================');

    const response = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    const text = await response.text();

    console.log('PHP STATUS:', response.status);
    console.log('PHP RESPONSE:', text);

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: 'Orders API returned invalid JSON',
          php_response: text,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            data?.message ||
            'Failed to fetch orders',
          data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });

  } catch (error) {
    console.error(
      'GET ORDERS ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}


// ==========================================
// ADD ORDER
// ==========================================

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    console.log(
      'ADD ORDER REQUEST:',
      body
    );

    const response = await fetch(
      ADD_API,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      }
    );

    const text =
      await response.text();

    console.log(
      'ADD ORDER STATUS:',
      response.status
    );

    console.log(
      'ADD ORDER RESPONSE:',
      text
    );

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message:
            'Order API returned invalid JSON',
          php_response: text,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message:
            data?.message ||
            'Failed to add order',
          data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });

  } catch (error) {
    console.error(
      'POST ORDER ERROR:',
      error
    );

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add order',
      },
      { status: 500 }
    );
  }
}