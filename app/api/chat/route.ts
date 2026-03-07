import { streamText, convertToModelMessages, UIMessage } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth-config"

const openai = createOpenAI({
  apiKey: process.env.api_key,
})

export const maxDuration = 60

const SYSTEM_PROMPT = `You are an AI tutor assistant called "AIGrader" designed to help students improve their academic performance. You have access to the student's Google Classroom data including their courses, assignments, grades, and submission status.

Your capabilities include:
1. **Grade Analysis**: Analyze the student's grades across courses, identify patterns, and highlight areas that need improvement.
2. **Study Planning**: Create personalized study plans based on upcoming assignments, current grades, and areas of weakness.
3. **Concept Explanation**: Help explain difficult concepts in subjects the student is struggling with.
4. **Assignment Help**: Provide guidance on how to approach assignments (without doing the work for them).
5. **Motivation & Support**: Offer encouragement and help students stay motivated.

Guidelines:
- Be encouraging and supportive, never judgmental about grades
- Provide specific, actionable advice
- When analyzing grades, look for trends and patterns
- For study plans, consider the student's current workload and priorities
- When explaining concepts, use clear language and examples
- Always encourage the student to seek help from their teachers when needed
- Format responses clearly with headings, bullet points, and numbered lists when appropriate

If the student's classroom data is not available, you can still provide general study tips and academic advice, but let them know you'd be more helpful with their specific data.`

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { messages, classroomContext } = body as { messages: UIMessage[], classroomContext?: string }
    
    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Create system message with classroom context
    const systemMessage = classroomContext
      ? `${SYSTEM_PROMPT}\n\n--- STUDENT'S CLASSROOM DATA ---\n${classroomContext}\n--- END CLASSROOM DATA ---`
      : SYSTEM_PROMPT

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemMessage,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
