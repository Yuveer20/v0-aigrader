export interface Course {
  id: string
  name: string
  section?: string
  descriptionHeading?: string
  room?: string
  ownerId?: string
  courseState?: "ACTIVE" | "ARCHIVED" | "PROVISIONED" | "DECLINED" | "SUSPENDED"
  alternateLink?: string
  teacherGroupEmail?: string
  courseGroupEmail?: string
  teacherFolder?: {
    id: string
    title: string
    alternateLink: string
  }
  guardiansEnabled?: boolean
  calendarId?: string
}

export interface CourseWork {
  id: string
  courseId: string
  title: string
  description?: string
  state: "PUBLISHED" | "DRAFT" | "DELETED"
  workType: "ASSIGNMENT" | "SHORT_ANSWER_QUESTION" | "MULTIPLE_CHOICE_QUESTION"
  maxPoints?: number
  dueDate?: {
    year: number
    month: number
    day: number
  }
  dueTime?: {
    hours: number
    minutes: number
  }
  alternateLink?: string
  creationTime?: string
  updateTime?: string
}

export interface StudentSubmission {
  id: string
  courseId: string
  courseWorkId: string
  userId: string
  state: "NEW" | "CREATED" | "TURNED_IN" | "RETURNED" | "RECLAIMED_BY_STUDENT"
  late?: boolean
  assignedGrade?: number
  draftGrade?: number
  alternateLink?: string
  courseWorkType?: string
  creationTime?: string
  updateTime?: string
}

export interface CourseWithDetails extends Course {
  courseWork?: CourseWork[]
  submissions?: StudentSubmission[]
  averageGrade?: number
  totalAssignments?: number
  completedAssignments?: number
}

export interface ClassroomData {
  courses: CourseWithDetails[]
  totalCourses: number
  overallAverage?: number
}
