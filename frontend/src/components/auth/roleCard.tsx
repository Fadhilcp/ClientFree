import React from 'react';

interface SingleCardProps {
  image: string;
  CardTitle: string;
  CardDescription: string;
  Button?: string;
  titleHref?: string;
  btnHref?: string;
  onClick?: () => void;
}

const SingleCard: React.FC<SingleCardProps> = ({
  image,
  CardTitle,
  CardDescription,
  Button,
  titleHref,
  onClick,
}) => {
  return (
    <div className="flex flex-col justify-between h-full border-2 border-indigo-500 dark:border-indigo-400 rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden transition hover:shadow-lg dark:hover:shadow-indigo-500/20">
      <div>
        <div className="p-6 text-center">
          <h3>
            <a
              href={titleHref ?? '/#'}
              className="mb-3 block text-xl font-semibold text-gray-900 dark:text-white"
            >
              {CardTitle}
            </a>
          </h3>

          <div className="p-4">
            <img
              src={image}
              alt={CardTitle}
              className="w-full max-w-[50%] mx-auto h-48 object-cover rounded-md"
            />
          </div>

          <p className="text-base text-gray-700 dark:text-gray-300">
            {CardDescription}
          </p>
        </div>
      </div>

      {Button && (
        <div className="px-6 pb-6">
          <button
            onClick={onClick}
            className="tracking-wide font-semibold bg-indigo-600 text-white w-full py-3 rounded-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-300"
          >
            <span>{Button}</span>
          </button>
        </div>
      )}
    </div>
  );

};

export default SingleCard;