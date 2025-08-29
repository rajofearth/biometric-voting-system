import { NextRequest, NextResponse } from "next/server";
import { updateProfileImage } from "../actions";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const result = await updateProfileImage(formData);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}


