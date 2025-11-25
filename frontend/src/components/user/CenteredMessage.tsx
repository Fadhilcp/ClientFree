import React from "react";

interface CenteredMessageProps {
  message: string;
}

const CenteredMessage: React.FC<CenteredMessageProps> = ({ message }) => {
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </section>
  );
};

export default CenteredMessage;