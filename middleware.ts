import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  // 1. تحديث الجلسة
  const response = await updateSession(request);

  // 2. فحص الأمان
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // إذا كان المستخدم غير مسجل ويحاول دخول لوحة التحكم الخاصة بالأدمن فقط
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/"; 
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
