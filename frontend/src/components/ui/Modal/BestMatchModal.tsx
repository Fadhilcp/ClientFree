import Button from "../Button";

type JobOption = {
  id: string;
  title: string;
};

interface BestMatchModalProps {
  open: boolean;
  jobs: JobOption[];
  selectedJobId: string;
  onChangeJob: (jobId: string) => void;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  loading: boolean;
}

const BestMatchModal = ({
  open,
  jobs,
  selectedJobId,
  onChangeJob,
  onCancel,
  onSubmit,
  loading,
}: BestMatchModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
         Select Job for Best Match
        </h2>

        <select
          value={selectedJobId}
          onChange={(e) => onChangeJob(e.target.value)}
          className="w-full px-3 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-sm text-gray-900
                dark:text-gray-100 border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-gray-400
                  dark:focus:border-gray-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a job</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 pt-4">
          <Button label="Cancel" variant="secondary" onClick={onCancel} />
          <Button
            label={loading ? "Loading..." : "Find Matches"}
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default BestMatchModal;