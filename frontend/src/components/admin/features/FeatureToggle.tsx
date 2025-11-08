import type React from "react";
import { clientFeatures, commonFeatures, freelancerFeatures, type FeatureKey } from "../../../constants/planFeatures";

interface Props {
  features: Record<FeatureKey, boolean>;
  userType: 'client' | 'freelancer';
  onChange: (key: FeatureKey, value: boolean) => void;
}

const FeatureToggles: React.FC<Props> = ({ features, userType, onChange }) => {
  const visibleFeatures: FeatureKey[] = [
    ...commonFeatures,
    ...(userType === 'client' ? clientFeatures : freelancerFeatures),
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {visibleFeatures.map((key) => (
        <label key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={features[key]}
            onChange={(e) => onChange(key, e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      ))}
    </div>
  );
};

export default FeatureToggles;