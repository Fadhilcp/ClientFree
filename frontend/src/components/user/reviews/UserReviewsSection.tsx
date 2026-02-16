import React, { useEffect, useState } from "react";
import Loader from "../../ui/Loader/Loader";
import ListWithHeader from "../ListWithHeader";
import Pagination from "../Pagination";
import { reviewService } from "../../../services/review.service";

interface ReviewDto {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: "client" | "freelancer";
  revieweeRole: "client" | "freelancer";
  rating: number;
  title: string;
  comment: string;
  isPublic: boolean;
  createdAt: string;
}

interface Props {
    userId: string;
    role: "client" | "freelancer" | "admin";
}

const UserReviewsSection: React.FC<Props> = ({ userId, role }) => {
    const [reviews, setReviews] = useState<ReviewDto[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 5;

    const fetchReviews = async (pageNumber: number) => {
        try {
        setLoading(true);
        const res = await reviewService.getUserReviews(
            userId,
            role,
            pageNumber,
            limit
        );

        if (res.data.success) {
            const { data, page, totalPages, total } = res.data.reviews;
            setReviews(data);
            setPage(page);
            setTotalPages(totalPages);
            setTotal(total);
        }
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, [userId, role]);

    return (
<div className="max-w-6xl mx-auto mt-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 
                bg-gradient-to-r from-indigo-50 via-white to-indigo-100 
                dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 
                p-8 border border-gray-100 dark:border-gray-700">
            {/* Reviews Section */}
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                Reviews
            </h2>

            {loading && <Loader />}

            {!loading && reviews.length === 0 && (
                <p className="text-gray-500">No reviews yet.</p>
            )}

            {reviews.length > 0 && (
            <>
                <ListWithHeader
                    title="User Reviews"
                    items={reviews}
                    columns={[
                        {
                            key: "rating",
                            header: "Rating",
                            render: (val) => (
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <i
                                        key={i}
                                        className={`fa-star fa-solid text-sm ${
                                            i < val ? "text-yellow-500" : "text-gray-300"
                                        }`}
                                    />
                                ))}
                                </div>
                            ),
                        },
                        {
                            key: "title",
                            header: "Title",
                            render: (val: string) => (
                                <p className="max-w-xs break-words whitespace-normal">
                                    {val}
                                </p>
                            ),
                        },
                        {
                            key: "comment",
                            header: "Comment",
                            render: (val: string) => (
                                <p className="max-w-md break-words whitespace-normal">
                                {val}
                                </p>
                            ),
                        },
                        {
                            key: "createdAt",
                            header: "Date",
                            render: (val) => new Date(val).toLocaleDateString(),
                        },
                    ]}
                />

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    entityLabel="reviews"
                    onPageChange={(p) => fetchReviews(p)}
                />
            </>
            )}
        </div>
    );
};

export default UserReviewsSection;