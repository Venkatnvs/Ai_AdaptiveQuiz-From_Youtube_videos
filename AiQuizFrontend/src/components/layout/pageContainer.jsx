import React from 'react'
import Header from './header'
import { ScrollArea } from '../ui/scroll-area'

const PageContainer = ({ children }) => {
    return (
        <div className="flex">
            <main className="w-full flex-1 overflow-hidden">
                <Header />
                <ScrollArea className='h-[calc(100dvh-65px)]' type="always">
                    <div className='absolute inset-0 h-full p-2 md:px-4'>
                        {children}
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}

export default PageContainer