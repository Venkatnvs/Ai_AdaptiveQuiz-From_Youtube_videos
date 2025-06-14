import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from './ProgressBar'
import { useNavigate, useParams } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import PageContainer from '@/components/layout/pageContainer'
import YouTube from 'react-youtube'
import { getSpecificCourse, startVideoSession, generateQuiz } from '@/apis/courses'

const statusIcon = {
  completed: '✅',
  in_progress: '🕓',
  not_started: '⏺️',
}

function getYouTubeId(url) {
  // Extracts the video ID from a YouTube URL
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
}

const CourseDetail = () => {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [showQuizBtn, setShowQuizBtn] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const playerRef = useRef(null)
  const [videoLoading, setVideoLoading] = useState([null, true])
  const [quizLoading, setQuizLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSpecificCourse(courseId)
      .then(res => {
        setCourse(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load course. Please try again.')
        setLoading(false)
      })
  }, [courseId])

  const handleWatch = (video) => {
    setVideoLoading([video.id, true])
    startVideoSession(courseId, video.id).then(res => {
      console.log(res)
      setCurrentVideo(video)
      setShowQuizBtn(false)
      setVideoProgress(0)
      setOpen(true)
      setVideoLoading([video.id, false])
      setCourse(prev => ({
        ...prev,
        videos: prev.videos.map(v => v.id === video.id ? { ...v, is_video_started: true } : v)
      }))
    })
  }

  const handleVideoEnd = () => {
    setShowQuizBtn(true)
  }

  const handleStateChange = (event) => {
    if (event.data === 1) { // playing
      const duration = event.target.getDuration()
      // Start interval to track progress
      if (!playerRef.current) {
        playerRef.current = setInterval(() => {
          const current = event.target.getCurrentTime()
          setVideoProgress(current / duration)
          // Show quiz button 5 seconds before end
          if (!showQuizBtn && duration - current <= 5) {
            setShowQuizBtn(true)
          }
        }, 500)
      }
    } else if (event.data === 0) { // ended
      clearInterval(playerRef.current)
      playerRef.current = null
      handleVideoEnd()
    } else if (event.data === 2) { // paused
      clearInterval(playerRef.current)
      playerRef.current = null
    }
  }

  const handleDialogClose = () => {
    setOpen(false)
    setShowQuizBtn(false)
    setVideoProgress(0)
    clearInterval(playerRef.current)
    playerRef.current = null
  }

  const handleQuiz = () => {
    setQuizLoading(true)
    generateQuiz(courseId, currentVideo.id).then(res => {
      console.log(res)
      setQuizLoading(false)
      navigate(`/courses/${courseId}/videos/${currentVideo.id}/quiz`)
    })
  }

  const handleQuiz2 = (is_quiz_submitted) => {
    if (is_quiz_submitted) {
      navigate(`/courses/${courseId}/videos/${currentVideo.id}/quiz/analysis`)
    } else {
      navigate(`/courses/${courseId}/videos/${currentVideo.id}/quiz`)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto py-6 flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">Loading course...</span>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="max-w-6xl mx-auto py-6 flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </PageContainer>
    )
  }

  // Map video status for UI (optional: you can add more logic based on is_video_started/is_video_completed)
  const videos = (course.videos || []).map(video => ({
    ...video,
    status: video.is_video_completed ? 'completed' : video.is_video_started ? 'in_progress' : 'not_started',
    youtubeId: getYouTubeId(video.video_url),
  }))

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-6">
        <Button variant="outline" className="mb-6" onClick={() => navigate('/courses')}>{'<'} Back to All Courses</Button>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
            <ProgressBar progress={course.progress} label="Course Progress" />
          </div>
          <div className="flex flex-col gap-2 min-w-[220px]">
            <Card className="p-4 flex flex-col gap-2 items-center bg-background/80">
              <Badge variant="outline" className="mb-1">Total Stars: {course.stats?.stars ?? 0} ⭐</Badge>
              <Badge variant="outline" className="mb-1">Avg Score: {course.stats?.avgScore ?? 0}%</Badge>
              <Badge variant="secondary">AI Level: {course.stats?.aiLevel ?? 'N/A'}</Badge>
            </Card>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Videos List */}
          <Card className="px-0">
            <CardHeader>
              <CardTitle className="text-xl">Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No videos available.</div>
              ) : (
                videos.map(video => (
                  <Card key={video.id} className="flex flex-col sm:flex-row items-center justify-between p-3 border-muted/60 bg-muted/30">
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl">{statusIcon[video.status]}</span>
                      <div className="flex-1">
                        <div className="font-medium">{video.title}</div>
                      </div>
                      {video.is_video_completed && <Badge className="ml-2" variant="success">{course.quizHistory.find(q => q.video === video.id)?.is_quiz_submitted ? 'Quiz Submitted' : 'Quiz Available'}</Badge>}
                    </div>
                    <Button className="mt-2 sm:mt-0" size="sm" variant="outline" onClick={() => handleWatch(video)} disabled={videoLoading[0] === video.id && videoLoading[1]}>{videoLoading[0] === video.id && videoLoading[1] ? 'Loading...' : video?.is_video_started ? video?.is_video_completed ? 'Watch Again' : 'Continue watch' : 'Start'}</Button>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
          {/* Quiz History */}
          <Card className="px-0">
            <CardHeader className="border-b border-muted/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Quiz History</CardTitle>
                <Badge variant="outline" className="text-xs">Total Quizzes: {course.quizHistory?.length ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {!course.quizHistory || course.quizHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No quiz history available yet
                </div>
              ) : (
                course.quizHistory.map(q => (
                  <Card 
                    key={q.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-muted/60 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{videos.find(v => v.id === q.video)?.title}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{q.completed_at ? new Date(q.completed_at).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {
                          q.is_quiz_submitted ? (
                            <span className="text-muted-foreground">
                              Completed at: {q.completed_at ? new Date(q.completed_at).toLocaleDateString() : ''}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Quiz Not Submitted
                            </span>
                          )
                        }
                      </div>
                    </div>
                    {
                      q.is_quiz_submitted ? (
                        <div className="flex gap-3 items-center mt-3 sm:mt-0">
                      <div className="flex items-center gap-1">
                        <Badge variant={q.score >= 80 ? "success" : q.score >= 60 ? "warning" : "destructive"}>
                          {q.score}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {q.stars} <span className="text-yellow-400">⭐</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" className="w-full" onClick={() => navigate(`/courses/${courseId}/videos/${q.video}/quiz/analysis`)}>View Analysis</Button>
                      </div>
                    </div>
                      ) : (
                        <div className="flex gap-3 items-center mt-3 sm:mt-0">
                          <Button variant="outline" className="w-full" onClick={() => navigate(`/courses/${courseId}/videos/${q.video}/quiz`)}>Start Quiz</Button>
                        </div>
                      )
                    }
                    
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        {/* Video Modal */}
        <Dialog open={open} onOpenChange={handleDialogClose} modal>
          <DialogContent className="min-w-2xl p-4 rounded-2xl shadow-2xl border-2 border-primary/20 bg-background/95" hideClose
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">{currentVideo?.title}</DialogTitle>
            </DialogHeader>
            {currentVideo && (
              <div className="flex flex-col gap-6">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <YouTube
                    videoId={currentVideo.youtubeId}
                    className="w-full h-full"
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: { autoplay: 1 },
                    }}
                    onEnd={handleVideoEnd}
                    onStateChange={handleStateChange}
                  />
                </div>
                {
                  currentVideo.is_video_completed ? (
                    <div className="flex flex-col gap-2">
                      <Badge variant="success">Quiz Available</Badge>
                      <Button className="w-full animate-fade-in" onClick={() => handleQuiz2(course.quizHistory.find(q => q.video === currentVideo.id)?.is_quiz_submitted)} disabled={quizLoading}>
                        {course.quizHistory.find(q => q.video === currentVideo.id)?.is_quiz_submitted ? 'View Quiz Analysis' : 'Start Quiz'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <ProgressBar progress={videoProgress} label="Video Progress" />
                      { videoProgress >= 0.98   && (
                        <Button className="w-full animate-fade-in" onClick={handleQuiz} disabled={quizLoading}>
                          {quizLoading ? 'Generating Quiz...' : 'Generate Quiz'}
                        </Button>
                      )}
                    </div>
                  )
                }
              </div>
            )}
            <DialogFooter className="mt-2 flex justify-end">
              <Button onClick={handleDialogClose} className="bg-red-500 hover:bg-red-600">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  )
}

export default CourseDetail 