import React, { useEffect, useState } from "react";
import { reviewService } from "../../../services/review.service";
import type { ReviewDto } from "../../../types/review.types";

type CreateReviewSectionProps = {
  jobId: string;
  existingReview: ReviewDto | null;
  onReviewSaved: (review: ReviewDto) => void;
  loading?: boolean;
};

const CreateReviewSection: React.FC<CreateReviewSectionProps> = ({
  jobId,
  existingReview,
  onReviewSaved,
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (existingReview && isEditing) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || "");
      setComment(existingReview.comment || "");
    }
  }, [existingReview, isEditing]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let savedReview: ReviewDto;

      if (existingReview) {
        const res = await reviewService.editReview(existingReview.id, {
          rating,
          title,
          comment,
        });
        savedReview = res.data.review;
      } else {
        const res = await reviewService.createReview({
          jobId,
          rating,
          title,
          comment,
        });
        savedReview = res.data.review;
      }

      onReviewSaved(savedReview);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {existingReview && !isEditing && (
        <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 
                        dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 
                        shadow-lg hover:shadow-xl transition-shadow duration-300 space-y-4">
          
          {/* Rating Stars */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`fa-star ${
                  i < existingReview.rating
                    ? "fa-solid text-yellow-400 drop-shadow-sm"
                    : "fa-regular text-gray-400 dark:text-gray-500"
                }`}
              />
            ))}
          </div>

          {/* Title */}
          {existingReview.title && (
            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {existingReview.title}
            </h4>
          )}

          {/* Comment */}
          {existingReview.comment && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base break-words">
              {existingReview.comment}
            </p>
          )}
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium 
                      hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400
                      transition-all duration-200 shadow-md"
          >
            <i className="fa-solid fa-pen mr-2"></i> Edit Review
          </button>
        </div>
      )}

      {(!existingReview || isEditing) && (
          <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-8 space-y-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-lg">
            
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <i className="fa-solid fa-star text-yellow-400"></i> 
            {existingReview ? "Edit Your Review" : "Leave a Review"}
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
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold 
                      px-6 py-3 rounded-lg shadow-md hover:from-indigo-500 hover:to-indigo-400 
                      transition-transform transform hover:scale-[1.01] disabled:opacity-50"
          >
            {
            loading
              ? "Saving..."
              : existingReview
              ? "Update Review"
              : "Submit Review"
            }
          </button>
        </div>
    )}
    </div>
  )
};

export default CreateReviewSection;