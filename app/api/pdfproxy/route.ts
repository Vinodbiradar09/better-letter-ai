import { connectDB } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Letter from "@/app/model/Letter";
import { currentUser } from "@/app/helpers/currentUser";
import { v2 as cloudinary } from "cloudinary";
import User from "@/app/model/User";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Ensure user is authenticated
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // 2. Verify the logged-in user exists
    const loggedUser = await User.findById(user.id);
    if (!loggedUser || loggedUser._id.toString() !== user.id.toString()) {
      return NextResponse.json(
        { message: "User not found or not authorized", success: false },
        { status: 403 }
      );
    }

    // 3. Extract publicId from query
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    if (!publicId) {
      return NextResponse.json(
        { message: "Missing publicId parameter", success: false },
        { status: 400 }
      );
    }

    // 4. Verify this letter belongs to the user
    const letter = await Letter.findOne({ publicId, from: loggedUser._id });
    if (!letter) {
      return NextResponse.json(
        { message: "Letter not found or not yours", success: false },
        { status: 404 }
      );
    }

    // 5. Fetch Cloudinary resource metadata
    let resource;
    try {
      resource = await cloudinary.api.resource(publicId, {
        resource_type: "raw",
      });
    } catch (apiError) {
      return NextResponse.json(
        {
          message: "Cloudinary resource lookup failed",
          success: false,
          error: apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 404 }
      );
    }

    // 6. Generate a signed URL for secure access
    const version = resource.version;
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      format: "pdf",
      version,
      sign_url: true,
      expire_seconds: 600, // valid for 10 min
    });

    // 7. Download the PDF into a buffer
    const cloudRes = await fetch(signedUrl);
    if (!cloudRes.ok) {
      const err = await cloudRes.text();
      return NextResponse.json(
        {
          message: "Failed to fetch PDF from Cloudinary",
          error: err,
          success: false,
        },
        { status: cloudRes.status }
      );
    }

    const buffer = await cloudRes.arrayBuffer();

    // 8. Return the PDF inline (open in browser tab)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=letter.pdf",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : null,
        success: false,
      },
      { status: 500 }
    );
  }
}
