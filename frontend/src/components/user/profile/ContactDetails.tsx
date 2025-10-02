import React from 'react';

const ContactDetails: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        Contact Details
      </h2>
      <div className="w-16 h-1 bg-blue-600 mb-4"></div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Phone: +92 300 1234567</p>
        <p>City: Lahore</p>
        <p>State: Punjab</p>
        <p>Country: Pakistan</p>
      </div>
    </div>
  );
};

export default ContactDetails;
