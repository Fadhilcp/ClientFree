interface ExternalLink {
  type: string;
  url: string;
}

interface ExternalLinksProps {
  links: ExternalLink[];
  error : any;
  onChange: (index: number, updated: ExternalLink) => void;
  onRemove: (index: number) => void;
}

export const ExternalLinks: React.FC<ExternalLinksProps> = ({ links, error, onChange, onRemove }) => { 
  const externalLinkErrors = error?.externalLinks ?? [];
    return (
  <div className="md:col-span-2">
    {links.map((link, index) => (
      <div key={index} className="mb-6">
        {/* Vertical container */}
        <div className="flex flex-col gap-1">
          {/* Horizontal input row */}
          <div className="flex gap-2">
            <select
              value={link.type}
              onChange={(e) => onChange(index, { ...link, type: e.target.value })}
              className="w-1/3 px-3 py-4 rounded-lg border bg-gray-100"
            >
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="website">Website</option>
              <option value="dribbble">Dribbble</option>
              <option value="behance">Behance</option>
              <option value="twitter">Twitter</option>
            </select>

            <input
              type="text"
              value={link.url}
              onChange={(e) => onChange(index, { ...link, url: e.target.value })}
              placeholder="https://example.com"
              className="w-2/3 px-3 py-4 rounded-lg border bg-gray-100"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-2 bg-red-500 text-white rounded"
            >
              ✕
            </button>
          </div>

          {/* Error messages stacked below */}
          <div className="text-red-500 text-sm space-y-1">
            {externalLinkErrors[index]?.type && <p>{externalLinkErrors[index].type}</p>}
            {externalLinkErrors[index]?.url && <p>{externalLinkErrors[index].url}</p>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

}