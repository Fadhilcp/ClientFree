interface ResumeSectionProps {
  resumeFile: File | null;
  uploading: boolean;
  resumeUrl?: string;
  setResumeFile: (file: File) => void;
  error?: string;
}

const ResumeSection = ({
  resumeFile,
  uploading,
  resumeUrl,
  setResumeFile,
  error
}: ResumeSectionProps) => {
  return (
    <div className="border-t border-gray-700 pt-6 mb-4 md:col-span-2">
      <h3 className="font-semibold mb-2">Resume</h3>

      {/* Upload state */}
      {uploading && (
        <p className="text-sm pb-1 text-gray-500">Uploading resume…</p>
      )}

      {/* File input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if(!file) return;
          setResumeFile(file);
        }}
        className="text-sm text-gray-700 dark:text-gray-300"
      />

      {/* Existing resume (signed URL) */}
      {resumeUrl && !resumeFile && (
        <p className="text-sm mt-2">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View uploaded resume
          </a>
          <span className="ml-2 text-xs text-gray-500">
            (link expires)
          </span>
        </p>
      )}

      {/* Selected file preview */}
      {resumeFile && (
        <p className="text-sm mt-2 text-green-600">
          Selected: {resumeFile.name}
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default ResumeSection
