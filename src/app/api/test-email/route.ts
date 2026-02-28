import { NextResponse } from "next/server";
import { sendEmail } from "@/services/email";

export async function GET() {
  try {
    const result = await sendEmail({
      to: "admin@skylux.pro",
      subject: "SKYLUX Email Test",
      html: "<h1>Email is working!</h1><p>If you see this, SMTP is configured correctly.</p>",
    });
    return NextResponse.json({ success: result, message: result ? "Email sent!" : "Email failed" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
