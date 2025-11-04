import React from 'react';

type ContactItem = {
  icon: React.ReactNode;
  text: string;
};

type ProfileHeaderProps = {
  name: string;
  title: string;
  contacts: ContactItem[];
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, title, contacts }) => {
  return (
    <div className="md:w-3/4 text-center md:text-left md:pl-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        {name}
      </h1>
      <h2 className="text-xl md:text-2xl font-medium mb-4 text-gray-700 dark:text-gray-300">
        {title}
      </h2>

      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-100 dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-30 rounded-full px-4 py-1"
          >
            <span className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300">
              {contact.icon}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{contact.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;