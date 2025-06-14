import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)

const CategoryList = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {categories.map(cat => (
        <Tooltip key={cat.id}>
          <TooltipTrigger asChild>
            <Card
              className={`flex flex-col items-center min-w-[120px] p-4 m-2 cursor-pointer transition border-2 bg-background hover:bg-accent/40 hover:scale-[1.04] ${selectedCategory === cat.id ? 'border-primary shadow-xl ring-2 ring-primary/30' : 'border-muted shadow-sm'}`}
              onClick={() => onSelect(cat.id)}
            >
              <Avatar className="w-14 h-14 mb-2">
                <AvatarImage src={cat.image} alt={cat.name} />
                <AvatarFallback>{getInitials(cat.name)}</AvatarFallback>
              </Avatar>
              <span className={`font-semibold text-center text-sm ${selectedCategory === cat.id ? 'text-primary' : ''}`}>{cat.name}</span>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom">{cat.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export default CategoryList 