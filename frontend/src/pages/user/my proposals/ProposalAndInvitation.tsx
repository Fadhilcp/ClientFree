import React, { useEffect, useState } from "react";
import Card, { type ActionItem } from "../../../components/ui/Card/Card";
import SearchBar from "../../../components/ui/SearchBar";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { proposalService } from "../../../services/proposal.service";
import type { IProposal } from "../../../types/job/proposal.type";
import Spinner from "../../../components/ui/Loader/Spinner";


const LIMIT = 20;

const ProposalAndInvitation: React.FC = () => {
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const isInitialLoading = loading && proposals.length === 0;
  const isScrollLoading  = loading && proposals.length > 0;


  const [isInvitation, setIsInvitation] = useState(false);
  const navigate = useNavigate();

  // for infinit scroll
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchProposals = async (loadMore = false) => {
    if(loading) return;
    if(!hasMore && loadMore) return;

    setLoading(true);
    try {
      const safeCursor = cursor ?? ""

      const response = await proposalService.proposalsForClient(
        isInvitation, 
        searchQuery,
        loadMore ? safeCursor : "",
        LIMIT
      );
      if (response.data.success) {
        const { proposals, nextCursor } = response.data;

        loadMore ? setProposals(prev => [ ...prev, ...proposals]) : setProposals(proposals);

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
    setProposals([]);
    setCursor(null);
    setHasMore(true);
    fetchProposals();
  }, [isInvitation]);

   // infinit scroll even listener
    useEffect(() => {
      const handleScroll = () => {
        if (loading || !hasMore) return;
        
        const bottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200;
  
        if (bottom) {
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
    fetchProposals();
  }, [searchQuery]);

  const handleViewDetails = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      {isInitialLoading && <Loader />}
      <div className="container mx-auto">
      {/* Title + Search + Dropdown aligned */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* Title */}
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500 order-1 sm:order-none">
          {isInvitation ? "Invitations" : "Proposals"}
        </h2>

        {/* Dropdown + Search grouped */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 order-2 sm:order-none w-full sm:w-auto">
          {/* Dropdown toggle */}
          <select
            value={isInvitation ? "invitations" : "proposals"}
            onChange={(e) => setIsInvitation(e.target.value === "invitations")}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 text-gray-700 dark:text-white 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="proposals">Proposals</option>
            <option value="invitations">Invitations</option>
          </select>

          {/* Search Bar */}
          <SearchBar
            placeholder={isInvitation ? "Search invitations..." : "Search jobs..."}
            onSearch={handleSearch}
          />
        </div>
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
              title={proposal.invitation?.title || proposal.job?.title || `Job #${proposal.job?.id}`}
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
                  label: "View Job",
                  onClick: () => handleViewDetails(proposal.job?.id!),
                  variant: "primary",
                }
              ].filter(Boolean) as ActionItem[]}
            />
          ))}

          {/* infinite scroll loader */}
          {isScrollLoading && hasMore && (
            <div className="flex justify-center py-4">
              <Spinner size={36} />
            </div>
          )}
          
          {!hasMore && (
            <p className="text-center text-gray-400 py-4">{ isInvitation ? `No more invitation` : `No more proposals` }.</p>
          )}
      </div>
    </section>
  );
};

export default ProposalAndInvitation;