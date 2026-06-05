import {
  NextRequest,
  NextResponse,
} from 'next/server';

const BASE_URL =
  'http://nextlayer.soon.it/api/Filament';

export async function GET() {
  try {
    const response =
      await fetch(
        `${BASE_URL}/get.php`,
        {
          cache: 'no-store',
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data
    );
  } catch (error) {
    return NextResponse.json({
      status: false,
      message:
        'Failed to fetch filament',
    });
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const response =
      await fetch(
        `${BASE_URL}/add.php`,
        {
          method: 'POST',
          body: formData,
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data
    );
  } catch (error) {
    return NextResponse.json({
      status: false,
      message:
        'Failed to add filament',
    });
  }
}

export async function PUT(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const response =
      await fetch(
        `${BASE_URL}/edit.php`,
        {
          method: 'POST',
          body: formData,
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data
    );
  } catch (error) {
    return NextResponse.json({
      status: false,
      message:
        'Failed to update filament',
    });
  }
}

export async function DELETE(
  req: NextRequest
) {
  try {
    const formData =
      await req.formData();

    const response =
      await fetch(
        `${BASE_URL}/delete.php`,
        {
          method: 'POST',
          body: formData,
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data
    );
  } catch (error) {
    return NextResponse.json({
      status: false,
      message:
        'Failed to delete filament',
    });
  }
}