import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/pageContainer'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { get_ai_level } from '@/lib/Qtable'
import { getQuizSession } from '@/apis/courses'

const QuizAnalysisPage = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getQuizSession(courseId, videoId)
      .then(res => {
        setAnalysis(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load quiz analysis. Please try again.')
        setLoading(false)
      })
  }, [courseId, videoId])

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">Loading analysis...</span>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </PageContainer>
    )
  }

  if (!analysis || !analysis.questions || analysis.questions.length === 0) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">No analysis data available.</span>
        </div>
      </PageContainer>
    )
  }

  const total = analysis.questions.length
  const correctCount = analysis.questions.filter(q => q.is_correct).length
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const stars = analysis.stars ?? 0
  const adaptationLevel = analysis.adaptation_level ?? 0

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-background dark:to-background/80 py-8">
        <div className="w-full max-w-4xl flex flex-col gap-8 items-center justify-center">
          <Card className="w-full shadow-2xl border-2 border-primary/10 bg-background/95">
            <CardHeader className="flex flex-col gap-2 border-b border-muted/40 items-center">
              <CardTitle className="text-2xl font-bold mb-2">Quiz Analysis</CardTitle>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-lg font-semibold">Score: <span className="text-primary">{correctCount} / {total}</span></div>
                <div className="text-lg font-semibold">Stars: <span className="text-primary">{stars}</span></div>
                <div className="text-lg font-semibold">Adaptation Level: <span className="text-primary">{get_ai_level(adaptationLevel)}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-3 bg-primary transition-all" style={{ width: `${percent}%` }} />
                </div>
                <div className="text-sm text-muted-foreground">{percent}% correct</div>
                <Badge variant={percent >= 80 ? 'success' : percent >= 60 ? 'warning' : 'destructive'} className="mt-2 text-base px-4 py-1">
                  {percent >= 80 ? 'Excellent!' : percent >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-8 flex flex-col gap-6">
              {analysis.questions.map((q, idx) => (
                <Card key={q.id} className={`p-4 border-2 ${q.is_correct ? 'border-green-400 bg-green-50/60' : 'border-red-300 bg-red-50/60'} transition-all`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>{q.is_correct ? '✔' : '✗'}</span>
                    <span className="font-semibold text-base">Question {idx + 1}:</span>
                    <span className="text-base font-medium">{q.text}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {q.options.map((opt, i) => {
                      const correctIdx = q.correct_answer ? parseInt(q.correct_answer, 10) - 1 : -1
                      const userIdx = q.selected ? parseInt(q.selected, 10) - 1 : -1
                      return (
                        <div
                          key={i}
                          className={`rounded px-3 py-2 text-sm flex items-center gap-2
                            ${i === correctIdx ? 'bg-green-200/80 text-green-900 font-semibold' : ''}
                            ${i === userIdx && i !== correctIdx ? 'bg-red-200/80 text-red-900 font-semibold' : ''}
                          `}
                        >
                          {i === correctIdx && <span className="font-bold">Correct</span>}
                          {i === userIdx && i !== correctIdx && <span className="font-bold">Your Answer</span>}
                          <span>{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4 justify-between items-center mt-4">
              <Button variant="secondary" onClick={() => navigate(-1)}>Back to Course</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default QuizAnalysisPage 