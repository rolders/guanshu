import { createTestUsers } from "@/lib/actions/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await createTestUsers();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in test-users API route:", error);
    return NextResponse.json(
      { error: "Failed to create test users" },
      { status: 500 }
    );
  }
}
