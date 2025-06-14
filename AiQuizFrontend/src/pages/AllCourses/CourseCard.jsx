import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const ProgressBar = ({ progress }) => (
    <div className="w-full bg-muted rounded-full h-2 mb-2">
        <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
        />
    </div>
)

const CourseCard = ({ course, onClick, onWatch }) => {
    return (
        <Card
            className={`flex flex-col h-full shadow-sm hover:shadow-lg transition border border-muted/60 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    {course.started && !course.completed && <Badge variant="secondary">In Progress</Badge>}
                    {course.completed && <Badge variant="secondary">Completed</Badge>}
                </div>
                <CardDescription className="line-clamp-2 mb-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{course.videos} videos</Badge>
                </div>
                {course.started && (
                    <div className="w-full">
                        <p className="text-sm text-muted-foreground">{Math.round(course.progress * 100)}% completed</p>
                        <ProgressBar progress={course.progress} />
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="w-full cursor-pointer" variant={course.started ? 'default' : 'secondary'} onClick={e => { e.stopPropagation(); onWatch && onWatch(); onClick && onClick(); }}>
                            {course.started && !course.completed ? 'Continue Course' : course.completed ? 'Completed' : 'Start'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {course.started && !course.completed ? 'Continue where you left off' : course.completed ? 'View Course' : 'Start this course'}
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    )
}

export default CourseCard

