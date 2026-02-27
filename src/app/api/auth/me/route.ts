import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  const result = await authenticateUser(req);
  if ("error" in result) return result.error;
  return NextResponse.json({ success: true, data: { user: result.user } });
}
