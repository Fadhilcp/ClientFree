import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService } from "../../../services/subscription.service";
import { useDispatch } from "react-redux";
import { setSubscription } from "../../../features/authSlice";
import { CheckCircleIcon } from "@heroicons/react/24/solid";


const BillingSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState<"checking" | "active" | "failed">("checking");

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 25;
    let delay = 2000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkSubscription = async () => {
      try {
        attempts++;

        const res = await subscriptionService.getMySubscription();
        const subscription = res?.data?.subscription ?? null;

        if (subscription) {
          dispatch(setSubscription(subscription));
          setStatus("active");

          setTimeout(() => {
            navigate("/home", { replace: true });
          }, 1200);

          return;
        }

        if (attempts >= maxAttempts) {
          setStatus("failed");
          return;
        }

        delay = Math.min(delay + 500, 6000);

        timeoutId = setTimeout(checkSubscription, delay);
      } catch {
        setStatus("failed");
      }
    };

    timeoutId = setTimeout(checkSubscription, delay);

    return () => clearTimeout(timeoutId);
  }, [dispatch, navigate]);

 return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        {status === "checking" && (
            <>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Finalizing your subscription…
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
                Please wait while we confirm your payment.
            </p>
            <div className="mt-6 animate-pulse">
                <div className="mx-auto h-2 w-2/3 rounded-full bg-indigo-500/40 dark:bg-indigo-400/40" />
            </div>
            </>
        )}

        {status === "active" && (
            <>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Subscription Activated
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
                Redirecting to your dashboard…
            </p>
            <div className="mt-6">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <CheckCircleIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </span>
            </div>
            </>
        )}

        {status === "failed" && (
            <>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Verification taking longer than expected
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
                Your payment may still be processing. Please check again later.
            </p>

            <button
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                        text-white font-medium rounded-lg shadow 
                        transition-colors duration-200"
                onClick={() => navigate("/premium")}
            >
                Go back
            </button>
            </>
        )}
        </div>
    </div>
    );
};
export default BillingSuccess;
