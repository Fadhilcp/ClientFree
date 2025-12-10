import { useState } from "react";
import Button from "../../ui/Button";
import TextAreaSection from "../../ui/TextAreaSection";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string, files: File[]) => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Submit Milestone
        </h2>

        <TextAreaSection
          name="note"
          value={note}
          onChange={(val: string) => setNote(val)}
          label="Note"
          placeholder="Add submission note..."
        />

        <input
          type="file"
          multiple
          className="mt-4 text-gray-800 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 
                    file:rounded-full file:border-0 
                    file:text-sm file:font-semibold 
                    file:bg-indigo-50 file:text-indigo-700 
                    hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-200"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button label="Cancel" onClick={onClose} variant="secondary" />
          <Button
            label="Submit"
            onClick={() => {
              onSubmit(note, files);
              onClose();
            }}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;