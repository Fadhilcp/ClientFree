import React, { useEffect, useState } from 'react';
import SubscriptionCard from '../../components/user/premium/subscriptionCard';
import Loader from '../../components/ui/Loader/Loader';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { notify } from '../../utils/toastService';
import { planService } from '../../services/plan.service';
import { subscriptionService } from '../../services/subscription.service';
import Button from '../../components/ui/Button';

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
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
 
  useEffect(() => {
    planService.getActivePlans(user?.role || '')
      .then((res) => {
        if (res.data.success) {
          setPlans(res.data.plans);
        }
        setLoading(false);
      })
      .catch((err) => {
        notify.error(err.response?.data?.error ||'Failed to fetch plans');
        console.error('Failed to fetch plans:', err);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async (planId: string, billingInterval: 'monthly' | 'yearly') => {
    if (!user?.isProfileComplete) {
      notify.warn('Please complete your profile before subscribing');
      return;
    }

    try {
      const response = await subscriptionService.create({
        userId: user.id,
        email: user.email,
        contact: user.phone,
        planId,
        billingInterval,
      });

      const { checkoutUrl } = response.data;

      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL missing");
      }

      window.location.href = checkoutUrl;

    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to start subscription');
    }
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

            <div className="mb-6 flex justify-center space-x-4">
              <Button
                className={`px-4 py-1 rounded-sm ${
                billingInterval === 'monthly'
                ? '' 
                : 'dark:bg-gray-700 dark:text-white text-gray-800 hover:text-white hover:bg-indigo-600'
              }`}
                variant={
                    billingInterval === 'monthly'
                      ? 'primary'
                      : 'secondary'
                  }
                  onClick={() => setBillingInterval('monthly')}
                  label='Monthly'
                />
    
              <Button
              className={`px-4 py-1 rounded-sm ${
                billingInterval === 'yearly' 
                ? '' 
                : 'dark:bg-gray-700 dark:text-white text-gray-800 hover:text-white hover:bg-indigo-600'
              }`}
                variant={
                    billingInterval === 'yearly'
                      ? 'primary'
                      : 'secondary'
                  }
                onClick={() => setBillingInterval('yearly')}
                label='Yearly'
              />
            </div>
            
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
                  billingInterval={billingInterval}
                  price={billingInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  features={mapFeatures(plan.features)}
                  onSubscribe={() => handleSubscribe(plan.id, billingInterval)}
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