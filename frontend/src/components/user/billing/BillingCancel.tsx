import { useNavigate } from "react-router-dom";
import { XCircleIcon } from "@heroicons/react/24/solid"; 

const BillingCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
       
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900">
            <XCircleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
          </span>
        </div>

        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Subscription Cancelled
        </h1>

        <p className="mt-3 text-gray-600 dark:text-gray-400">
          You exited the payment process. No charges were made.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                       text-white font-medium rounded-lg shadow 
                       transition-colors duration-200"
            onClick={() => navigate("/premium", { replace: true })}
          >
            Try Again
          </button>

          <button
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 
                       text-gray-800 dark:bg-gray-700 dark:text-gray-200 
                       dark:hover:bg-gray-600 font-medium rounded-lg shadow 
                       transition-colors duration-200"
            onClick={() => navigate("/home", { replace: true })}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingCancel;