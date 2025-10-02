import React from 'react';

const OnlineLinks: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        Online Presence
      </h2>
      <div className="w-16 h-1 bg-blue-600 mb-4"></div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Email: umairarshad6697@gmail.com</p>
        <p>LinkedIn: linkedin.com/in/umairarshad-dev</p>
        <p>Portfolio: portfolio-five-flame-90.vercel.app</p>
      </div>
    </div>
  );
};

export default OnlineLinks;