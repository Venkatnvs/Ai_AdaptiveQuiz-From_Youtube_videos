import React from 'react'
import { Link } from 'react-router-dom'

const MainLogo = () => {
  return (
    <Link to="/" className="flex cursor-pointer items-center gap-1 w-full justify-center">
        <img src="/logo.svg" alt="logo" width={30} height={30} />
        <h1 className="text-3xl text-blue-500 font-bold max-lg:hidden ml-2">AdaptiveLearn AI</h1>
    </Link>
  )
}

export default MainLogo