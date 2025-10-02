import React from 'react'

const CompanyDetails : React.FC = () => {
  return (
    <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        Company Details
        </h2>
        <div className="w-16 h-1 bg-blue-600 mb-4"></div>
        <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium text-gray-700">Company Name:</span> Urbanloop Tech</p>
        <p><span className="font-medium text-gray-700">Industry:</span> Software Development</p>
        <p><span className="font-medium text-gray-700">Website:</span> <a href="https://urbanloop.tech" className="text-blue-600 hover:underline">urbanloop.tech</a></p>
        </div>
    </div>
  )
}

export default CompanyDetails
