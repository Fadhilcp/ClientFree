import React from 'react'
import Button from '../../ui/Button'
import { useNavigate } from 'react-router-dom'

const FreelancerHero: React.FC = () => {
    const navigate = useNavigate();
  return (
    <>
        <h1 className="text-3xl md:text-4xl lg:text-5xl mb-20 font-extrabold text-gray-900 dark:text-white leading-tight">
        Find projects that match your <span className="text-indigo-600 dark:text-indigo-500">skills</span>
        </h1>

        <h2 className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <span className="block mt-2 font-bold">
                Discover jobs, submit proposals, and work with clients worldwide.
            </span>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
            <Button
                label="Browse Job"
                onClick={() => navigate("/find-jobs")}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold"
            />
            </div>
            <span className="block mt-2 text-1xl">
                Apply to projects that fit your expertise and availability.
            </span>
            <span className="block mt-2 text-1xl">
                Get paid securely, communicate with clients easily, and build your reputation with every successful project.
            </span>
        </h2>
    </>
  )
}

export default FreelancerHero
