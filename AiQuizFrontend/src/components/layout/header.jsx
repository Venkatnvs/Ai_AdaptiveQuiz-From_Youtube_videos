import React, { useEffect, useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/actions/authActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { getTotalStars } from '@/apis/courses/dashboard';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const pathname = useLocation().pathname;
  const dispatch = useDispatch();
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    if (user) {
      getTotalStars().then(res => {
        setTotalStars(res.data.total_stars);
      });
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
  }
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 gap-5">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="AdaptiveLearn AI" width={32} height={32} />
              <h1 className="text-xl font-bold text-gray-900">AdaptiveLearn AI</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/dashboard" className={`relative bg-gray-100 text-gray-900 px-3 py-1 rounded-full items-center ${pathname === '/dashboard' ? 'bg-gray-200' : ''}`}>
                <span className='text-sm font-medium'>Dashboard</span>
              </Link>
              <Link to="/courses" className={`relative bg-gray-100 text-gray-900 px-3 py-1 rounded-full items-center ${pathname === '/courses' ? 'bg-gray-200' : ''}`}>
                <span className='text-sm font-medium'>All Courses</span>
              </Link>
              <Link to="/q-table" className={`relative bg-gray-100 text-gray-900 px-3 py-1 rounded-full items-center ${pathname === '/q-table' ? 'bg-gray-200' : ''}`}>
                <span className='text-sm font-medium'>Q-Table</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">
                {totalStars || 0}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.full_name}`}
                      alt={user?.full_name}
                    />
                    <AvatarFallback>
                      {user?.email?.[0]}
                      {user?.email?.[1]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>{user?.full_name}</p>
                    <p className='text-xs leading-none text-muted-foreground truncate' title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleLogout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header