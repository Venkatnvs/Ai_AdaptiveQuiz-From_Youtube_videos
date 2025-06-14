import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/layout/pageContainer'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dummy quiz data
const quizData = {
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
      answer: 0,
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
      answer: 0,
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
      answer: 0,
    },
  ],
}

const transitionClasses = {
  enter: 'opacity-0 translate-x-8',
  enterActive: 'opacity-100 translate-x-0 transition-all duration-500',
  exit: 'opacity-100 translate-x-0',
  exitActive: 'opacity-0 -translate-x-8 transition-all duration-500',
}

const QuizPage = () => {
  const { courseId, videoId } = useParams()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [transition, setTransition] = useState('')

  const handleOption = idx => setSelected(idx)

  const handleNext = () => {
    setTransition('exit')
    setTimeout(() => {
      setAnswers([...answers, selected])
      setSelected(null)
      setCurrent(current + 1)
      setTransition('enter')
      setTimeout(() => setTransition(''), 500)
    }, 500)
  }

  const handleSubmit = () => {
    const allAnswers = [...answers, selected]
    let correct = 0
    quizData.questions.forEach((q, i) => {
      if (allAnswers[i] === q.answer) correct++
    })
    setScore(correct)
    setShowResult(true)
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setShowResult(false)
    setScore(0)
    setTransition('')
  }

  const q = quizData.questions[current]

  return (
    <PageContainer>
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-background dark:to-background/80 py-8">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch justify-center">
          {/* Left: Progress & Question */}
          <div className="flex-1 flex flex-col justify-center">
            <Card className="shadow-xl border-2 border-primary/10 bg-background/95 w-full h-full">
              <CardHeader className="flex flex-col gap-2 border-b border-muted/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Quiz</CardTitle>
                  <Badge variant="secondary">{current + 1} / {quizData.questions.length}</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-2 bg-primary transition-all" style={{ width: `${((current + (showResult ? 1 : 0)) / quizData.questions.length) * 100}%` }} />
                </div>
                <div className="text-muted-foreground text-sm">Course #{courseId} • Video #{videoId}</div>
              </CardHeader>
              <CardContent className="py-8 min-h-[220px] flex flex-col justify-center">
                {showResult ? (
                  <div className="flex flex-col items-center gap-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Quiz Result</h2>
                    <div className="text-lg">Score: <span className="font-semibold">{score} / {quizData.questions.length}</span></div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button variant="secondary" onClick={handleRestart}>Retry</Button>
                      <Button onClick={() => navigate(-1)}>Back to Course</Button>
                      <Button variant="default" onClick={() => navigate(`/courses/${courseId}/videos/${videoId}/quiz/analysis`)}>View Analysis</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`transition-all duration-500 ${transition ? transitionClasses[transition] : ''}`} key={q.id}>
                    <div className="mb-4">
                      <div className="text-lg font-semibold mb-2">Question {current + 1} of {quizData.questions.length}</div>
                      <div className="text-xl mb-4 font-bold text-primary/90">{q.question}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Right: Options & Actions */}
          {!showResult && (
            <div className="flex-1 flex flex-col justify-center">
              <Card className="shadow-xl border-2 border-primary/10 bg-background/95 w-full h-full">
                <CardHeader className="border-b border-muted/40">
                  <CardTitle className="text-lg font-semibold">Select an Option</CardTitle>
                </CardHeader>
                <CardContent className="py-8 flex flex-col gap-4">
                  <div className="grid gap-4">
                    {q.options.map((opt, idx) => (
                      <Button
                        key={idx}
                        variant={selected === idx ? 'default' : 'outline'}
                        className={`w-full text-left text-base py-6 transition-all border-2 ${selected === idx ? 'ring-2 ring-primary border-primary bg-primary/90 text-white scale-[1.03]' : 'border-muted'} hover:scale-[1.01]'}`}
                        onClick={() => handleOption(idx)}
                        disabled={selected !== null}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {current < quizData.questions.length - 1 ? (
                    <Button onClick={handleNext} disabled={selected === null} className="px-8 py-2 rounded-lg">Next</Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={selected === null} className="px-8 py-2 rounded-lg">Submit</Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default QuizPage 