import { logout } from '@/store/actions/authActions'
import React from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const MainDashboard = () => {
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to the AI Quiz Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8">Select an option from the sidebar to get started.</p>
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <p className="text-center text-gray-500">This is the main dashboard area.</p>
      </div>
      <button 
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  )
}

export default MainDashboard