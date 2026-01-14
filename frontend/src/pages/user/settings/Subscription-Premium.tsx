import { useEffect, useState } from "react";
import { subscriptionService } from "../../../services/subscription.service";
import { notify } from "../../../utils/toastService";
import Loader from "../../../components/ui/Loader/Loader";
import Button from "../../../components/ui/Button";
import { useDispatch } from "react-redux";
import { setSubscription } from "../../../features/authSlice";
import ListWithHeader from "../../../components/user/ListWithHeader";
import SettingSection from "../../../components/user/settings/SettingSection";
import Pagination from "../../../components/user/Pagination";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";
import { capitalize } from "../../../utils/formatters";

interface PlanFeatures {
  VerifiedBadge: boolean;
  PremiumSupport: boolean;
  BestMatch: boolean;
  HigherJobVisibility: boolean;
  UnlimitedInvites: boolean;
  DirectMessaging: boolean;
  AIProposalShortlisting: boolean;
  HigherProfileVisibility: boolean;
  UnlimitedProposals: boolean;
  PriorityNotifications: boolean;
}

interface SubscriptionInfo {
  planName: string;
  userType: "client" | "freelancer";
  features: PlanFeatures;
  expiryDate: string;
}

const SubscriptionSetting = () => {
  const [loading, setLoading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionInfo | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  console.log("🚀 ~ SubscriptionSetting ~ transactions:", transactions)
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    const loadActiveSubscription = async () => {
      try {
        const res = await subscriptionService.getMySubscription();
        setActiveSubscription(res.data.subscription || null);
      } catch {
        notify.error("Failed to load active subscription");
      }
    };

    loadActiveSubscription();
  }, []);

  const fetchTransactions = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await subscriptionService.getMyHistory(pageNumber, limit);
      
      const { data, total, totalPages } = res.data.subscriptions;

      setTransactions(data || []);
      setTotal(total || 0);
      setTotalPages(totalPages || 0);
      setPage(pageNumber);
    } catch {
      notify.error("Failed to load subscription history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  const handleCancelSubscription = async () => {

    setLoading(true);
    try {
      await subscriptionService.cancelSubscription();
      notify.success("Subscription cancelled");

      dispatch(setSubscription(null));
      setActiveSubscription(null);
      setShowCancelModal(false);
    } catch {
      notify.error("Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}

      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? This action cannot be undone."
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelModal(false)}
      />

      <h1 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-500">
        Subscription
      </h1>

      {/* CURRENT PLAN */}
        <div>
          <h3 className="text-indigo-600 dark:text-indigo-500 text-lg font-semibold">Current Plan</h3>
          <p className="text-sm text-gray-600">Your active subscription and included features.</p>
        </div>
        {activeSubscription ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg mt-3 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activeSubscription.planName}
                </h2>
                <p className="text-sm text-gray-500">
                  Expires on{" "}
                  {new Date(activeSubscription.expiryDate).toLocaleDateString()}
                </p>
              </div>

              <Button
                label="Cancel Subscription"
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                onClick={() => setShowCancelModal(true)}
              />
            </div>

            {/* FEATURES */}
            <ul className="grid gap-2 text-sm">
              {Object.entries(activeSubscription.features)
              .filter(([_, enabled]) => enabled === true)
              .map(([key, enabled]) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-green-600"
                >
                  {enabled ? "✔" : "✖"} {key.replace(/([A-Z])/g, " $1").trim()}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No active subscription</p>
        )}

      {/* HISTORY */}
      <SettingSection
        title="Subscription History"
        description="All your subscription-related transactions."
      >
        <ListWithHeader
          title="All Subscriptions"
          items={transactions}
          columns={[
            { key: "planName", header: "Plan Name" },
            {
              key: "amount",
              header: "Amount",
              render: (val, item) => (
                <span
                  className={
                    item.direction === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {item.direction === "credit" ? "+" : "-"} {item.currency}{" "}
                  {val}
                </span>
              ),
            },
            { key: "status", header: "Status", render: (val) => capitalize(val) },
            { key: "billingInterval", header: "Billing Interval", render: (val) => capitalize(val) },
            {
              key: "createdAt",
              header: "Date",
              render: (val) => new Date(val).toLocaleString(),
            },
          ]}
        />
        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          entityLabel="subscriptions"
          onPageChange={(newPage) => fetchTransactions(newPage)}
        />
        </SettingSection>
    </>
  );
};

export default SubscriptionSetting;
