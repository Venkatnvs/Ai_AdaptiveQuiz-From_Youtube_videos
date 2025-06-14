import PageContainer from '@/components/layout/pageContainer'
import React, { useState, useEffect } from 'react'
import CategoryList from './CategoryList'
import CourseCard from './CourseCard'
import { useNavigate } from 'react-router-dom'
import { getCourses } from '@/apis/courses'

const MainCoursesPage = () => {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getCourses()
      .then(res => {
        const data = res.data
        setCategories(data)
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load courses. Please try again.')
        setLoading(false)
      })
  }, [])

  const filteredCourses = React.useMemo(() => {
    if (!categories || !selectedCategory) return []
    const cat = categories.find(c => c.id === selectedCategory)
    if (!cat) return []
    // Map API course fields to CourseCard expected props
    return (cat.courses || []).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      videos: course.total_videos || 0, // fallback if not present
      progress: course.progress || 0,
      started: course.is_course_started || false,
      completed: course.is_course_completed || false,
    }))
  }, [categories, selectedCategory])

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 p-2 flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">Loading courses...</span>
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
        <h1 className="text-2xl font-bold mb-4">All Courses</h1>
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">No courses found in this category.</div>
          ) : (
            filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} onClick={() => navigate(`/courses/${course.id}`)} />
            ))
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default MainCoursesPage