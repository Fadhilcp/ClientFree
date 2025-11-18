import React, { useEffect, useRef, useState } from "react";
import ProfileImage from "../profile/ProfileImage";
import { notify } from "../../../utils/toastService";
import { userService } from "../../../services/user.service";
import Loader from "../../ui/Loader/Loader";

interface ProfileImageUploaderProps {
  imageUrl?: string;
  onChange: (file: File | null,previewUrl: string, action: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ imageUrl, onChange }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(imageUrl || '');

  useEffect(() => {
    setPreview(imageUrl || "");
  }, [imageUrl]);

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
    onChange(file, previewUrl, "preview-added");
  };

    const handleRemove = async() => {
        if (!preview && !imageUrl) {
          notify.error("No profile image found to remove");
          return;
        }

        if (preview.startsWith("blob:")) {
          const original = imageUrl || "";
          setPreview(original);
          onChange(null, original, "preview-removed");
          notify.success("Preview removed");
          return;
        }
        setLoading(true);
        try {
          const response = await userService.removeProfileImage();
          if (response.data.success) {
            setPreview("");
            onChange(null, "", "backend-removed");
            notify.success("Profile image removed");
          }
        } catch (error: any) {
          notify.error(error.response?.data?.error || "Failed to remove image");
        } finally {
          setLoading(false);
        }
    };

    if (loading) return <Loader />;
  return (
    <div className="relative flex flex-col items-center">
      <ProfileImage src={preview || imageUrl || ""} size={160} />

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
        {(preview || imageUrl) && (
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