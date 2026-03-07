import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth-config"
import { fetchClassroomData } from "@/lib/classroom"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authConfig)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Session expired, please sign in again" }, { status: 401 })
  }

  try {
    const classroomData = await fetchClassroomData(session.accessToken)
    return NextResponse.json(classroomData)
  } catch (error) {
    console.error("Error fetching classroom data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch classroom data" },
      { status: 500 }
    )
  }
}
