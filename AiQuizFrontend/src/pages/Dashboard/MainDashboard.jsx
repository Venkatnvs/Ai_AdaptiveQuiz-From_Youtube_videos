import React, { useState, useEffect } from 'react'
import PageContainer from '@/components/layout/pageContainer'
import DashboardStats from './DashboardStats'
import RecentActivity from './RecentActivity'
import CourseCard from '../AllCourses/CourseCard'
import { useNavigate } from 'react-router-dom'
import { getDashboardInfo } from '@/apis/courses/dashboard'

const MainDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [startedCourses, setStartedCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    getDashboardInfo()
      .then(res => {
        setStats(res.data.stats)
        setStartedCourses(res.data.startedCourses || [])
        setActivities(res.data.activities || [])
        setIsLoading(false)
      })
      .catch(() => {
        setError('Failed to load dashboard. Please try again.')
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 p-2 flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">Loading dashboard...</span>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 p-2 flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 p-2">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <DashboardStats stats={stats} isLoading={isLoading} />
        <h2 className="text-xl font-semibold my-2">Courses You've Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {startedCourses.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">No started courses found.</div>
          ) : (
            startedCourses.map(course => (
              <CourseCard key={course.id} course={{
                ...course,
                videos: course.total_videos || 0,
                progress: course.progress || 0,
                started: course.is_course_started || false,
                completed: course.is_course_completed || false,
              }} onClick={() => navigate(`/courses/${course.id}`)} />
            ))
          )}
        </div>
        <div className="mt-6">
          <RecentActivity activities={activities} isLoading={isLoading} />
        </div>
      </div>
    </PageContainer>
  )
}

export default MainDashboard