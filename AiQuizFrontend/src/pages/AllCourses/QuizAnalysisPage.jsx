import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/pageContainer'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dummy analysis data
const analysis = {
  score: 2,
  total: 3,
  questions: [
    {
      id: 1,
      question: 'What is a React component?',
      options: [
        'A reusable piece of UI',
        'A database query',
        'A CSS framework',
        'A backend API',
      ],
      correct: 0,
      user: 0,
    },
    {
      id: 2,
      question: 'Which hook is used for state in React?',
      options: [
        'useState',
        'useEffect',
        'useContext',
        'useReducer',
      ],
      correct: 0,
      user: 2,
    },
    {
      id: 3,
      question: 'JSX stands for?',
      options: [
        'JavaScript XML',
        'Java Syntax Extension',
        'JavaScript XHR',
        'JavaScript Extra',
      ],
      correct: 0,
      user: 0,
    },
  ],
}

const QuizAnalysisPage = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const percent = Math.round((analysis.score / analysis.total) * 100)

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-background dark:to-background/80 py-8">
        <div className="w-full max-w-3xl flex flex-col gap-8 items-center justify-center">
          <Card className="w-full shadow-2xl border-2 border-primary/10 bg-background/95">
            <CardHeader className="flex flex-col gap-2 border-b border-muted/40 items-center">
              <CardTitle className="text-2xl font-bold mb-2">Quiz Analysis</CardTitle>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="text-lg font-semibold">Score: <span className="text-primary">{analysis.score} / {analysis.total}</span></div>
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
                <Card key={q.id} className={`p-4 border-2 ${q.user === q.correct ? 'border-green-400 bg-green-50/60' : 'border-red-300 bg-red-50/60'} transition-all`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold ${q.user === q.correct ? 'text-green-700' : 'text-red-700'}`}>{q.user === q.correct ? '✔' : '✗'}</span>
                    <span className="font-semibold text-base">Question {idx + 1}:</span>
                    <span className="text-base font-medium">{q.question}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`rounded px-3 py-2 text-sm flex items-center gap-2
                          ${i === q.correct ? 'bg-green-200/80 text-green-900 font-semibold' : ''}
                          ${i === q.user && i !== q.correct ? 'bg-red-200/80 text-red-900 font-semibold' : ''}
                        `}
                      >
                        {i === q.correct && <span className="font-bold">Correct</span>}
                        {i === q.user && i !== q.correct && <span className="font-bold">Your Answer</span>}
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4 justify-between items-center mt-4">
              <Button variant="secondary" onClick={() => navigate(-1)}>Back to Course</Button>
              <Button onClick={() => navigate(`/courses/${courseId}/videos/${videoId}/quiz`)} variant="default">Retake Quiz</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default QuizAnalysisPage 