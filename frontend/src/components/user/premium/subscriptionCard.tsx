import React from 'react';
import Button from '../../ui/Button';

interface Props {
  planType: string;
  billingInterval: string;
  price: number;
  features: { label: string; included: boolean }[];
  onSubscribe: () => void;
  isActive?: boolean;   // <-- new prop
}

const SubscriptionCard: React.FC<Props> = ({
  planType,
  billingInterval,
  price,
  features,
  onSubscribe,
  isActive = false,
}) => {
  return (
    <div
      className={`w-full max-w-xs p-4 rounded-lg shadow-sm sm:p-6 flex flex-col
        ${isActive
          ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
          : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
        }`}
    >
      <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">
        {planType} plan
      </h5>

      <div className="flex items-baseline text-gray-900 dark:text-white">
        <span className="text-2xl font-semibold">₹</span>
        <span className="text-3xl font-extrabold tracking-tight">{price}</span>
        <span className="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">
          /{billingInterval}
        </span>
      </div>

      <ul role="list" className="space-y-5 my-7">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex ${!feature.included ? 'line-through decoration-gray-500' : ''}`}
          >
            <svg
              className={`shrink-0 w-4 h-4 ${
                isActive
                  ? 'text-green-600 dark:text-green-500'
                  : feature.included
                    ? 'text-indigo-600 dark:text-indigo-500'
                    : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {isActive ? (
          <span className="inline-block w-full text-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
            Active Plan
          </span>
        ) : (
          <Button
            label="Choose plan"
            onClick={onSubscribe}
            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none 
                       focus:ring-indigo-200 dark:bg-indigo-600 dark:hover:bg-indigo-700 
                       dark:focus:ring-indigo-900 font-medium rounded-lg text-sm px-5 py-2.5 
                       inline-flex justify-center w-full text-center"
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;