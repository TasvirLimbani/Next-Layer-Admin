import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://nextlayer.soon.it/api/Filament";

/* =========================================================
   GET - LIST FILAMENTS
========================================================= */

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/get.php`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    console.log("========== GET FILAMENT ==========");
    console.log("Status:", response.status);
    console.log("Response:", text);

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data, {
        status: response.status,
      });
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "Filament API returned invalid JSON",
          raw: text,
        },
        {
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error("GET filament error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch filament",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST - ADD FILAMENT
========================================================= */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    console.log("========== ADD FILAMENT ==========");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          key,
          "FILE:",
          value.name,
          value.type,
          value.size
        );
      } else {
        console.log(key, ":", value);
      }
    }

    const response = await fetch(`${BASE_URL}/add.php`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    console.log("PHP add.php status:", response.status);
    console.log("PHP add.php response:", text);

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data, {
        status: response.status,
      });
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "add.php returned invalid JSON",
          raw: text,
        },
        {
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error("POST filament error:", error);

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to add filament",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT - EDIT FILAMENT
========================================================= */

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();

    console.log("========== EDIT FILAMENT ==========");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          key,
          "FILE:",
          value.name,
          value.type,
          value.size
        );
      } else {
        console.log(key, ":", value);
      }
    }

    const id = formData.get("id");

    console.log("EDIT ID:", id);

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message: "Filament ID is required for edit",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     * Edit MUST go to edit.php.
     * Never send this request to add.php.
     */

    const response = await fetch(`${BASE_URL}/edit.php`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    console.log("PHP edit.php status:", response.status);
    console.log("PHP edit.php response:", text);

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data, {
        status: response.status,
      });
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "edit.php returned invalid JSON",
          raw: text,
        },
        {
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error("PUT filament error:", error);

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update filament",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE - DELETE FILAMENT
========================================================= */

export async function DELETE(req: NextRequest) {
  try {
    const formData = await req.formData();

    console.log("========== DELETE FILAMENT ==========");

    for (const [key, value] of formData.entries()) {
      console.log(key, ":", value);
    }

    const response = await fetch(`${BASE_URL}/delete.php`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    console.log("PHP delete.php status:", response.status);
    console.log("PHP delete.php response:", text);

    try {
      const data = JSON.parse(text);

      return NextResponse.json(data, {
        status: response.status,
      });
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "delete.php returned invalid JSON",
          raw: text,
        },
        {
          status: 502,
        }
      );
    }
  } catch (error) {
    console.error("DELETE filament error:", error);

    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete filament",
      },
      {
        status: 500,
      }
    );
  }
}