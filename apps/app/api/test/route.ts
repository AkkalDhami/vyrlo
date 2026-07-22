import { logger } from "@/lib/log";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await logger.error({
      message: "This is an error message",
      importance: "medium",
      service: "test",
    });
    return NextResponse.json({
      message: "Error logged successfully"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
