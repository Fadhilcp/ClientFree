import React from 'react'

const SkillList : React.FC = () => {
  return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                Skills
            </h2>
            <div className="w-16 h-1 bg-blue-600 mb-4"></div>
            <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">React</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">TypeScript</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">Remix</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">Tailwind CSS</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">JavaScript</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <span className="font-medium">CSS</span>
                </div>
            </div>
        </div>
  )
}

export default SkillList
