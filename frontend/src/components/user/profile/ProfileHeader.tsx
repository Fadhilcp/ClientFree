import React from 'react'

const ProfileHeader : React.FC = () => {
  return (
    <div className="md:w-3/4 text-center md:text-left md:pl-8">

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Muhammad Umair Arshad</h1>
        <h2 className="text-xl md:text-2xl font-medium mb-4">Frontend Developer</h2>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
            
            <div className="flex items-center bg-opacity-20 rounded-full px-4 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">umairarshad6697@gmail.com</span>
            </div>

            <div className="flex items-center bg-opacity-20 rounded-full px-4 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                </svg>
                <span className="text-sm">linkedin.com/in/umairarshad-dev</span>
            </div>
        </div>
    </div>
  )
}

export default ProfileHeader
