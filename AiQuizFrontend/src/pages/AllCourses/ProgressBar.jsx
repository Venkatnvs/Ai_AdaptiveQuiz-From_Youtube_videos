import React from 'react'

const ProgressBar = ({ progress, label }) => (
  <div className="w-full">
    {label && <div className="flex justify-between mb-1 text-xs text-muted-foreground">
      <span>{label}</span>
      <span>{Math.round(progress * 100)}%</span>
    </div>}
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  </div>
)

export { ProgressBar } 