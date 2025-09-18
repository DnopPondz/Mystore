import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "bunshop" },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: uploaded.secure_url, public_id: uploaded.public_id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
