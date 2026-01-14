import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../../config/stripe";
import { useState } from "react";

interface StripePaymentModalProps {
  clientSecret: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StripePaymentModal({
  clientSecret,
  isOpen,
  onClose,
  onSuccess
}: StripePaymentModalProps) {
  if (!isOpen || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/10 dark:bg-black/10 flex items-center justify-center px-4">
      {/* Modal Card */}
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 
                   max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </div>
    </div>
  );

}

/* ---------------- Checkout Form ---------------- */

function CheckoutForm({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required"
    });

    setLoading(false);

    if (result.error) {
      console.error(result.error.message);
      return;
    }

    onSuccess?.();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Fund Milestone</h2>

      <PaymentElement />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {loading ? "Processing..." : "Pay"}
        </button>
      </div>
    </form>
  );
}
