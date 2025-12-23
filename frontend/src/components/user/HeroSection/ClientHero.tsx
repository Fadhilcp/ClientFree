import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../ui/Button';

const ClientHero: React.FC = () => {
    const navigate = useNavigate();
  return (
    <>
        <h1 className="text-3xl md:text-4xl lg:text-5xl mb-20 font-extrabold text-gray-900 dark:text-white leading-tight">
        Let’s find the right <span className="text-indigo-600 dark:text-indigo-500">freelancer</span> for your project
        </h1>

        <h2 className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <span className="block mt-2 font-bold">
                Post your job details and start receiving proposals instantly.
            </span>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
            <Button
                label="Post a Job"
                onClick={() => navigate("/my-jobs/active-jobs")}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold"
            />
            <Button
                label="Browse Freelancers"
                variant="secondary"
                onClick={() => navigate("/freelancers")}
                className="px-6 py-3 font-semibold"
            />
            </div>
            <span className="block mt-2 text-1xl">
                Find skilled freelancers across every industry and hire with complete confidence.
            </span>
            <span className="block mt-2 text-1xl">
                With secure escrow payments, built-in chat and video calls, and transparent reviews, you can manage your project from start to finish—all in one place.
            </span>
        </h2>  
    </>
  )
}

export default ClientHero
