import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/pageContainer'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getQuizSession, submitQuiz } from '@/apis/courses'
import { Separator } from '@/components/ui/separator'
import { get_ai_level } from '@/lib/Qtable'

const transitionClasses = {
  enter: 'opacity-0 translate-x-8',
  enterActive: 'opacity-100 translate-x-0 transition-all duration-100',
  exit: 'opacity-100 translate-x-0',
  exitActive: 'opacity-0 -translate-x-8 transition-all duration-100',
}

const QuizPage = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [stars, setStars] = useState(0)
  const [adaptationLevel, setAdaptationLevel] = useState(0)
  const [transition, setTransition] = useState('')
  const [quizData, setQuizData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getQuizSession(courseId, videoId)
      .then(res => {
        setQuizData(res.data)
        setShowResult(res.data.is_quiz_submitted)
        setCurrent(res.data.is_quiz_submitted ? res.data.questions.length - 1 : 0)
        setScore(res.data.score / 10)
        setStars(res.data.stars)
        setAdaptationLevel(res.data.adaptation_level)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load quiz. Please try again.')
        setLoading(false)
      })
  }, [courseId, videoId])

  const handleOption = idx => setSelected(idx)

  const handleNext = () => {
    setTransition('exit')
    setTimeout(() => {
      setSelected(null)
      setCurrent(prev => prev + 1)
      setAnswers((prev) => [...prev, { question_id: quizData.questions[current].id, selected: selected+1 }])
      setTransition('enter')
      setTimeout(() => {
        setTransition('')
        if (cardRef.current) {
          cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }, 100)
  }

  const handleSubmit = () => {
    setSubmitLoading(true)
    const updatedAnswers = [...answers, { question_id: quizData.questions[current].id, selected: selected+1 }]
    setAnswers(updatedAnswers)
    setSelected(null)
    submitQuiz(courseId, videoId, { answers: updatedAnswers })
      .then(res => {
        setScore(res.data.score / 10)
        setStars(res.data.stars)
        setAdaptationLevel(res.data.adaptation_level)
        setShowResult(true)
        setSubmitLoading(false)
      })
      .catch(() => {
        setError('Failed to submit quiz. Please try again.')
        setSubmitLoading(false)
      })
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">Loading quiz...</span>
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

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="text-lg text-muted-foreground">No quiz questions available.</span>
        </div>
      </PageContainer>
    )
  }

  const q = quizData.questions[current]

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-background dark:to-background/80 py-8">
        <div className="w-full max-w-4xl flex flex-col items-center justify-center rounded-3xl shadow-2xl border border-primary/10 bg-white/80 dark:bg-background/80 overflow-hidden relative p-0">
          <Card ref={cardRef} className="w-full shadow-none border-none bg-transparent flex flex-col gap-0">
            <CardHeader className="flex flex-col gap-2 border-b border-muted/40 px-6 pt-6 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Quiz <span className="text-base font-normal text-muted-foreground">{current + 1} / {quizData.questions.length}</span></CardTitle>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-2 bg-primary transition-all" style={{ width: `${((current + (showResult ? 1 : 0)) / quizData.questions.length) * 100}%` }} />
              </div>
              <div className="text-muted-foreground text-sm">Course #{courseId} • Video #{videoId}</div>
            </CardHeader>
            <Separator />
            <CardContent className="py-0 min-h-[220px] flex flex-col justify-center flex-1 px-6">
              {showResult ? (
                <div className="flex flex-col items-center gap-6 animate-fade-in">
                  <h2 className="text-2xl font-bold">Quiz Result</h2>
                  <div className="text-lg">Score: <span className="font-semibold">{score} / {quizData.questions.length}</span></div>
                  <div className="text-lg">Stars: <span className="font-semibold">{stars}</span></div>
                  <div className="text-lg">Adaptation Level: <span className="font-semibold">{get_ai_level(adaptationLevel)}</span></div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button variant="secondary" onClick={() => navigate(-1)}>Back to Course</Button>
                    <Button variant="default" onClick={() => navigate(`/courses/${courseId}/videos/${videoId}/quiz/analysis`)}>View Analysis</Button>
                  </div>
                </div>
              ) : (
                <div className={`transition-all duration-500 ${transition ? transitionClasses[transition] : ''}`} key={q.id}>
                  <div className="mb-4">
                    <div className="text-lg font-semibold mb-2">Question {current + 1} of {quizData.questions.length}</div>
                    <div className="text-xl mb-4 font-bold text-primary/90 leading-snug break-words">{q.text}</div>
                  </div>
                  <div className={`grid gap-4 grid-cols-1 mb-6 animate-fade-in`}>
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleOption(idx)}
                        className={`w-full text-left whitespace-normal py-6 px-4 transition-all border-2 rounded-xl max-w-full break-words text-base shadow-sm
                          ${selected === idx
                            ? 'ring-2 ring-primary border-primary bg-primary/90 text-white scale-[1.03] shadow-lg'
                            : 'border-muted bg-white/80 dark:bg-background/80 hover:bg-primary/10 hover:border-primary/40'}
                          focus:outline-none focus:ring-2 focus:ring-primary/60
                        `}
                        tabIndex={0}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <hr className="my-4 border-muted/40" />
                  <div className="flex justify-end gap-2">
                    {current < quizData.questions.length - 1 ? (
                      <Button onClick={handleNext} disabled={selected === null} className="px-8 py-2 rounded-lg shadow-md">Next</Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={selected === null || submitLoading} className="px-8 py-2 rounded-lg shadow-md" loading={submitLoading} >{submitLoading ? 'Submitting...' : 'Submit'}</Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default QuizPage 