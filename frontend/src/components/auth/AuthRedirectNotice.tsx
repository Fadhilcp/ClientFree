import React from 'react'
import { Link } from 'react-router-dom';

interface AuthRedirectNoticeProps {
    message ?: string;
    linkText ?: string;
    linkTo ?: string;
}

const AuthRedirectNotice : React.FC<AuthRedirectNoticeProps> = (
    {message='Already have an account?',linkText='Log in',linkTo='/login'}
) => {
  return (
    <p className="mt-6 text-sm text-gray-600 text-center">
      {message}{" "}
      <Link to={linkTo} className="text-indigo-500 font-medium hover:underline">
        {linkText}
      </Link>
    </p>
  )
}

export default AuthRedirectNotice
