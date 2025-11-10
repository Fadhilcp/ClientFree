import React, { useRef, useState } from "react";
import ProfileImage from "../profile/ProfileImage";
// import { Camera } from "lucide-react";
import { notify } from "../../../utils/toastService";

interface ProfileImageUploaderProps {
  imageUrl?: string;
  onChange: (file: File | null,previewUrl: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ imageUrl, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(imageUrl || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        notify.error("Please upload a valid image file.");
        e.target.value = ""; 
        return;
    }
    if (file.size > 1024 * 1024) { 
        notify.error("Image size must be less than 1MB.");
        e.target.value = "";
        return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange(file, previewUrl);
  };

    const handleRemove = () => {
      setPreview('');
      onChange(null, '');
    };


  return (
    <div className="relative flex flex-col items-center">
      <ProfileImage src={imageUrl} size={160} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2 absolute bottom-4 right-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-white text-indigo-600 px-3 py-1 rounded-full shadow hover:bg-gray-100 transition"
        >
          Upload
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="bg-white text-red-500 px-3 py-1 rounded-full shadow hover:bg-gray-100 transition"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUploader;