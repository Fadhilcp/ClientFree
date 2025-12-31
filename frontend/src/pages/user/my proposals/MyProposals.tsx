import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate, useLocation } from "react-router-dom";
import { proposalService } from "../../../services/proposal.service";
import type { IProposal } from "../../../types/job/proposal.type";

const LIMIT=20;

const MyProposals: React.FC = () => {
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  // for infinit scroll==
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // derive invitation state from URL
  const isInvitation = location.pathname.includes("/invites");

  const fetchProposals = async (loadMore = false) => {

    if(loading) return;
    if(!hasMore && loadMore) return;

    setLoading(true);
    try {
      const safeCursor =  cursor ?? "";

      const response = await proposalService.myProposals(isInvitation, searchQuery, loadMore ? safeCursor : "", LIMIT);
      if (response.data.success) {
        const { proposals, nextCursor } = response.data;

        setProposals(prev => (loadMore ? [...prev, ...proposals] : proposals));
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
      }
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setLoading(false);
    }
  };

      useEffect(() => {
        const handleScroll = () => {
          const bottom = 
          window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 200;
  
          if(bottom && !loading && hasMore) {
            fetchProposals(true);
          }
        };
  
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, [loading, hasMore, fetchProposals]);

      const handleSearch = (query: string) => {
        setSearchQuery(query);
      };


      useEffect(() => {
        setProposals([]);
        setCursor(null);
        setHasMore(true);
      }, [searchQuery, isInvitation]);

      useEffect(() => {
        const delay = setTimeout(() => {
          fetchProposals(false);
        }, 400);

        return () => clearTimeout(delay);
      }, [searchQuery, isInvitation]);


      const handleViewDetails = (jobId: string) => {
        navigate(`/job-details/${jobId}`);
      };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
        {loading && <Loader />}
        <div className="container mx-auto">
        {/* Title + Search aligned */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
            {isInvitation ? "Invitations" : "Proposals"}
            </h2>
            <SearchBar
            placeholder={isInvitation ? "Search invitations..." : "Search jobs..."}
            onSearch={handleSearch}
            />
        </div>

        {/* Empty State */}
        {(!proposals || proposals.length === 0) && (
            <p className="text-gray-500 text-center py-10">
            {isInvitation ? "No invitations found." : "No proposals found."}
            </p>
        )}

        {/* Proposal Cards */}
        {proposals &&
            proposals.length > 0 &&
            proposals.map((proposal) => (
            <Card
                key={proposal.id}
                title={proposal.invitation?.title || `Job #${proposal.job?.title}`}
                subtitle={
                isInvitation
                    ? `Invitation from ${proposal.invitedBy ?? "Client"}`
                    : `Bid: ₹${proposal.bidAmount}`
                }
                meta={[
                { label: "Duration", value: proposal.duration || "N/A" },
                { label: "Status", value: proposal.status },
                {
                    label: "Created",
                    value: new Date(proposal.createdAt).toLocaleDateString(),
                },
                ]}
                description={
                isInvitation
                    ? proposal.invitation?.message || "No message provided."
                    : proposal.description
                }
                actions={[
                {
                    label: "View Details",
                    onClick: () => handleViewDetails(proposal.job?.id!),
                    variant: "primary",
                },
                !isInvitation
                    ? {
                        label: "Edit Proposal",
                        onClick: () => console.log("Edit proposal", proposal.id),
                        variant: "secondary",
                    }
                    : null,
                ].filter(Boolean) as ActionItem[]}
            />
            ))}
        </div>
    </section>
    );
};

export default MyProposals;