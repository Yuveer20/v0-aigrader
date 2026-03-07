import type { Course, CourseWork, StudentSubmission, CourseWithDetails, ClassroomData } from "@/types/classroom"

const CLASSROOM_API_BASE = "https://classroom.googleapis.com/v1"

export async function fetchCourses(accessToken: string): Promise<Course[]> {
  const response = await fetch(`${CLASSROOM_API_BASE}/courses?studentId=me&courseStates=ACTIVE`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch courses")
  }

  const data = await response.json()
  return data.courses || []
}

export async function fetchCourseWork(accessToken: string, courseId: string): Promise<CourseWork[]> {
  const response = await fetch(
    `${CLASSROOM_API_BASE}/courses/${courseId}/courseWork?courseWorkStates=PUBLISHED`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    // Some courses may not have coursework
    if (response.status === 404) return []
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch course work")
  }

  const data = await response.json()
  return data.courseWork || []
}

export async function fetchSubmissions(
  accessToken: string,
  courseId: string,
  courseWorkId: string
): Promise<StudentSubmission[]> {
  const response = await fetch(
    `${CLASSROOM_API_BASE}/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions?userId=me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) return []
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch submissions")
  }

  const data = await response.json()
  return data.studentSubmissions || []
}

export async function fetchAllSubmissionsForCourse(
  accessToken: string,
  courseId: string
): Promise<StudentSubmission[]> {
  const response = await fetch(
    `${CLASSROOM_API_BASE}/courses/${courseId}/courseWork/-/studentSubmissions?userId=me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) return []
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to fetch all submissions")
  }

  const data = await response.json()
  return data.studentSubmissions || []
}

export async function fetchClassroomData(accessToken: string): Promise<ClassroomData> {
  // Fetch all courses first
  const courses = await fetchCourses(accessToken)

  // Fetch coursework and submissions for each course
  const coursesWithDetails: CourseWithDetails[] = await Promise.all(
    courses.map(async (course) => {
      try {
        const [courseWork, submissions] = await Promise.all([
          fetchCourseWork(accessToken, course.id),
          fetchAllSubmissionsForCourse(accessToken, course.id),
        ])

        // Calculate grade statistics
        const gradedSubmissions = submissions.filter(
          (s) => s.assignedGrade !== undefined && s.assignedGrade !== null
        )

        const averageGrade =
          gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((sum, s) => sum + (s.assignedGrade || 0), 0) / gradedSubmissions.length
            : undefined

        const completedAssignments = submissions.filter(
          (s) => s.state === "TURNED_IN" || s.state === "RETURNED"
        ).length

        return {
          ...course,
          courseWork,
          submissions,
          averageGrade,
          totalAssignments: courseWork.length,
          completedAssignments,
        }
      } catch (error) {
        console.error(`Error fetching data for course ${course.id}:`, error)
        return {
          ...course,
          courseWork: [],
          submissions: [],
        }
      }
    })
  )

  // Calculate overall average
  const coursesWithGrades = coursesWithDetails.filter((c) => c.averageGrade !== undefined)
  const overallAverage =
    coursesWithGrades.length > 0
      ? coursesWithGrades.reduce((sum, c) => sum + (c.averageGrade || 0), 0) / coursesWithGrades.length
      : undefined

  return {
    courses: coursesWithDetails,
    totalCourses: courses.length,
    overallAverage,
  }
}

export function formatDueDate(dueDate?: { year: number; month: number; day: number }): string | null {
  if (!dueDate) return null
  return new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function getGradeColor(grade: number, maxPoints: number = 100): string {
  const percentage = (grade / maxPoints) * 100
  if (percentage >= 90) return "text-green-400"
  if (percentage >= 80) return "text-blue-400"
  if (percentage >= 70) return "text-yellow-400"
  if (percentage >= 60) return "text-orange-400"
  return "text-red-400"
}

export function getGradeLabel(percentage: number): string {
  if (percentage >= 90) return "A"
  if (percentage >= 80) return "B"
  if (percentage >= 70) return "C"
  if (percentage >= 60) return "D"
  return "F"
}
