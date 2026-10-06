import React from 'react'

const AuthImage: React.FC = () => {
  return (
    <div className="flex-1 bg-indigo-100 dark:bg-indigo-600 text-center hidden lg:flex">
      <div
        className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/auth-welcome.svg')",
        }}
        role="img"
        aria-label="Secure sign in to the freelance marketplace"
      />
    </div>
  );
};

export default AuthImage;