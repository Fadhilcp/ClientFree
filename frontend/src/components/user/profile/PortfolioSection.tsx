import type { Portfolio, PortfolioError } from "../../../types/profileModal.types";
import Button from "../../ui/Button";
import { InputSection } from "../profileModal/InputSection";

interface PortfolioSectionProps {
  portfolio: Portfolio[];
  updatePortfolio: (index: number, key: keyof Portfolio, value: string) => void;
  removePortfolio: (index: number) => void;
  addPortfolio: () => void;
  errors?: PortfolioError[]
}

const PortfolioSection = ({
  portfolio,
  updatePortfolio,
  removePortfolio,
  addPortfolio,
  errors
}: PortfolioSectionProps) => {
  return (
    <div className="space-y-4 border-t border-gray-700 py-6 md:col-span-2 ">
    <h3 className="font-semibold">Portfolio</h3>
    {portfolio.map((item, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
        <InputSection
            label="Title"
            value={item.title}
            onChange={(e) => updatePortfolio(i, "title", e.target.value)}
            error={errors?.[i]?.title}
        />
        <InputSection
            label="Link"
            value={item.link || ""}
            onChange={(e) => updatePortfolio(i, "link", e.target.value)}
            error={errors?.[i]?.link}
        />
        <Button className="px-4 py-2 rounded font-bold transition-colors duration-200 w-fit" variant="secondary" label="Remove" onClick={() => removePortfolio(i)} />
        </div>
    ))}
    <Button label="Add Portfolio Item" onClick={addPortfolio} />
    </div>
  )
}

export default PortfolioSection
