import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://nextlayer.soon.it/api/Color";

/* =========================
   HELPER
========================= */

async function parsePhpResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("PHP API returned invalid JSON:", text);

    return {
      status: false,
      message: "Color API returned invalid JSON",
      raw: text,
    };
  }
}

/* =========================
   GET - LIST
========================= */

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/list.php`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await parsePhpResponse(response);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Color GET error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Unable to connect to Color API",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST - ADD
========================= */

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let colors: string[] = [];

    /* -------------------------
       JSON REQUEST
    ------------------------- */

    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (Array.isArray(body.colors)) {
        colors = body.colors;
      } else if (body.name) {
        colors = [body.name];
      }
    }

    /* -------------------------
       FORM DATA REQUEST
    ------------------------- */

    else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();

      const formColors = formData.getAll("colors[]");

      if (formColors.length > 0) {
        colors = formColors.map((item) => String(item));
      } else {
        const name = formData.get("name");

        if (name) {
          colors = [String(name)];
        }
      }
    }

    /* -------------------------
       VALIDATE
    ------------------------- */

    colors = colors
      .map((color) => color.trim())
      .filter(Boolean);

    if (colors.length === 0) {
      return NextResponse.json(
        {
          status: false,
          message: "At least one color is required",
        },
        { status: 400 }
      );
    }

    /* -------------------------
       REMOVE DUPLICATES
    ------------------------- */

    const uniqueColors = Array.from(
      new Map(
        colors.map((color) => [
          color.toLowerCase(),
          color,
        ])
      ).values()
    );

    /* -------------------------
       CREATE PHP FORM DATA
    ------------------------- */

    const phpFormData = new FormData();

    uniqueColors.forEach((color) => {
      phpFormData.append("colors[]", color);
    });

    /* -------------------------
       CALL PHP API
    ------------------------- */

    const response = await fetch(`${API_BASE}/add.php`, {
      method: "POST",
      body: phpFormData,
      cache: "no-store",
    });

    const data = await parsePhpResponse(response);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Color POST error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Unable to add colors",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* =========================
   PUT - EDIT / STATUS
========================= */

export async function PUT(request: NextRequest) {
  try {
    const contentType =
      request.headers.get("content-type") || "";

    let id = "";
    let name = "";
    let status = "";

    /* JSON */

    if (contentType.includes("application/json")) {
      const body = await request.json();

      id = String(body.id ?? "");
      name = String(body.name ?? "");
      status = String(body.status ?? "");
    }

    /* FORM DATA */

    else {
      const formData = await request.formData();

      id = String(formData.get("id") ?? "");
      name = String(formData.get("name") ?? "");
      status = String(formData.get("status") ?? "");
    }

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message: "Color ID is required",
        },
        { status: 400 }
      );
    }

    /* -------------------------
       SEND TO PHP
    ------------------------- */

    const phpFormData = new FormData();

    phpFormData.append("id", id);
    phpFormData.append("name", name);
    phpFormData.append("status", status);

    const response = await fetch(`${API_BASE}/edit.php`, {
      method: "POST",
      body: phpFormData,
      cache: "no-store",
    });

    const data = await parsePhpResponse(response);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Color PUT error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Unable to update color",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE
========================= */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // First try query parameter:
    // /api/color?id=5
    let id = url.searchParams.get("id") || "";

    // If query parameter is missing, also support JSON body
    if (!id) {
      const contentType =
        request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          const body = await request.json();
          id = String(body.id ?? "");
        } catch {
          // Ignore invalid/empty JSON body
        }
      }

      // Also support form-data
      if (!id && contentType.includes("multipart/form-data")) {
        try {
          const formData = await request.formData();
          id = String(formData.get("id") ?? "");
        } catch {
          // Ignore invalid form-data
        }
      }
    }

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json(
        {
          status: false,
          message: "Color ID is required",
        },
        { status: 400 }
      );
    }

    console.log("Deleting color ID:", id);

    // Send ID to existing PHP API as form-data
    const phpFormData = new FormData();

    phpFormData.append("id", id);

    const response = await fetch(
      `${API_BASE}/delete.php`,
      {
        method: "POST",
        body: phpFormData,
        cache: "no-store",
      }
    );

    const data = await parsePhpResponse(response);

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    console.error("Color DELETE error:", error);

    return NextResponse.json(
      {
        status: false,
        message: "Unable to delete color",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}