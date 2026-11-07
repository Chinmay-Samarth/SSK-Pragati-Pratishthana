import { NextRequest, NextResponse } from "next/server";
import { isAllowedStaffEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function isSafeStoragePath(path: string): boolean {
  if (!path || path.length > 512) return false;
  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) {
    return false;
  }
  // Expected shape: <person-uuid>/<filename>
  return /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+$/i.test(path);
}

export async function GET(request: NextRequest) {
  const bucket = request.nextUrl.searchParams.get("bucket");
  const path = request.nextUrl.searchParams.get("path");

  if ((bucket !== "photos" && bucket !== "charts") || !path) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isSafeStoragePath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedStaffEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 30);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Could not sign URL" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { url: data.signedUrl },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
}
