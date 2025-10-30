import React, { useEffect, useState } from 'react';
import SubscriptionCard from '../../components/user/premium/subscriptionCard';
import axios from 'axios';
import Loader from '../../components/ui/Loader/Loader';

interface RawPlan {
  id: string;
  planName: string;
  userType: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  active: boolean;
}

interface FeatureItem {
  label: string;
  included: boolean;
}

const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<RawPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/plan/plans')
      .then((res) => {
        if (res.data.success) {
          setPlans(res.data.plans.filter((p: RawPlan) => p.active));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch plans:', err);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (planId: string, planName: string) => {
    alert(`Subscribed to ${planName} (ID: ${planId})`);
    // TODO: Call backend to create subscription
  };

  const mapFeatures = (features: string[]): FeatureItem[] => {
    if (!features || features.length === 0) return [{ label: 'No premium features', included: false }];
    return features.map((label) => ({ label, included: true }));
  };

return (
  <div className="min-h-screen bg-white dark:bg-gray-900 py-10 px-6">
    <div className="max-w-7xl mx-auto text-center">
      <h1 className="text-4xl font-extrabold mb-2">
        <span className="text-black dark:text-white">Go</span>{' '}
        <span className="text-indigo-600 dark:text-indigo-500">Premium</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Choose the plan that fits your goals
      </p>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6">
        {loading ? (
          <Loader/>
        ) : (
        <div className="flex justify-center">
          <div className={`grid gap-4 ${plans.length === 1 ? 'grid-cols-1' : plans.length === 2 ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                planType={plan.planName}
                billingInterval="monthly"
                price={plan.price.monthly}
                features={mapFeatures(plan.features)}
                onSubscribe={() => handleSubscribe(plan.id, plan.planName)}
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Subscriptions;