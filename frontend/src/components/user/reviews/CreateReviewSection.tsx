import { useEffect, useState } from "react";
import { reviewService } from "../../../services/review.service";

type CreateReviewSectionProps = {
  jobId: string;
};

const CreateReviewSection = ({ jobId }: CreateReviewSectionProps) => {
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);

    useEffect(() => {
        checkHasReviewed();
    }, []);

    const checkHasReviewed = async () => {
        try {
            const res = await reviewService.hasReviewed(jobId);
            setHasReviewed(res.data.hasReviewed);
        } catch {
            setHasReviewed(false);
        }
    };

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            setError("Rating must be between 1 and 5");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await reviewService.createReview({
                jobId,
                rating,
                title,
                comment,
            });

            setSuccess(true);
            setHasReviewed(true);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    if (hasReviewed === null) {
        return <p className="text-sm text-gray-500">Checking review status...</p>;
    }

    if (hasReviewed || success) {
        return (
            <div className="rounded-xl p-6 bg-green-50 dark:bg-green-900/20 shadow-md">
                <p className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i>
                    You have already submitted a review
                </p>
            </div>
        );
    }

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-8 space-y-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-lg">
      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
        <i className="fa-solid fa-star text-yellow-400"></i> Leave a Review
      </h3>

        {/* Rating */}
        <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Rating
            </label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className="transition-transform duration-300 ease-in-out hover:scale-110"
                >
                    <i
                    className={`fa-star text-2xl transition-all duration-300 ease-in-out ${
                        rating >= r
                        ? "fa-solid text-yellow-400"
                        : "fa-regular text-gray-400 dark:text-gray-500"
                    }`}
                    ></i>
                </button>
                ))}
            </div>
        </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 
                     px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Great experience"
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          maxLength={2000}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 
                     px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          rows={4}
          placeholder="Share your experience working on this job..."
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold 
                   px-6 py-3 rounded-lg shadow-md hover:from-indigo-500 hover:to-indigo-400 
                   transition-transform transform hover:scale-[1.01] disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

export default CreateReviewSection;