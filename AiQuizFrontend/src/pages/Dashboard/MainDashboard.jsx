import React, { useState } from 'react'
import PageContainer from '@/components/layout/pageContainer'
import DashboardStats from './DashboardStats'
import RecentActivity from './RecentActivity'
import CourseCard from '../AllCourses/CourseCard'
import { useNavigate } from 'react-router-dom'

const MainDashboard = () => {
  const navigate = useNavigate()
  const [stats] = useState({
    quizzesCompleted: 10,
    averageScore: 80,
    learningStreak: 5,
    adaptationLevel: "Intermediate",
  })
  const [isLoading] = useState(false)
  const [activities] = useState([
    {
      id: 1,
      type: "quiz_completed",
      title: "Quiz 1",
      description: "Completed quiz 1",
      date: "2021-01-01",
    },
    {
      id: 2,
      type: "video_processed",
      title: "Video 1",
      description: "Processed video 1", 
      date: "2021-01-01",
    },
    {
      id: 3,
      type: "quiz_completed",
      title: "Quiz 3",
      description: "Completed quiz 3",
      date: "2021-01-01",
    },
  ])

  const startedCourses = [
    {
      id: 1,
      title: 'React for Beginners',
      description: 'Learn the basics of React.js and build interactive UIs.',
      videos: 12,
      progress: 0.5,
      started: true,
    },
    {
      id: 3,
      title: 'Algebra Essentials',
      description: 'Master the fundamentals of algebra for all levels.',
      videos: 10,
      progress: 0.8,
      started: true,
    },
  ]

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 p-2">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <DashboardStats stats={stats} isLoading={isLoading} />
        <h2 className="text-xl font-semibold mt-4">Courses You've Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {startedCourses.map(course => (
            <CourseCard key={course.id} course={course} onClick={() => navigate(`/courses/${course.id}`)} />
          ))}
        </div>
        <div className="mt-6">
          <RecentActivity activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </PageContainer>
  )
}

export default MainDashboard