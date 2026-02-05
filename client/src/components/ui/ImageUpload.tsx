import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  defaultImage?: string;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ 
  onUploadSuccess, 
  defaultImage, 
  folder = "smartcare", 
  label = "Upload Image" 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, WebP).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum image size is 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const token = session?.access_token;

      if (!token) {
        throw new Error("Authentication required");
      }

      const sigRes = await fetch(`/api/upload/signature?folder=${folder}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!sigRes.ok) {
        const errorText = await sigRes.text();
        console.error("Signature error:", errorText);
        throw new Error("Failed to get upload signature");
      }
      
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      if (!cloudName || !apiKey || !signature) {
        throw new Error("Cloudinary not configured properly");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error("Cloudinary upload failed");
      }
      
      const data = await uploadRes.json();
      setPreview(data.secure_url);
      onUploadSuccess(data.secure_url);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePreview = () => {
    setPreview(null);
    onUploadSuccess("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="h-24 w-24 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={removePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max size: 5MB. Formats: JPG, PNG, WebP.
          </p>
        </div>
        
        {uploading && (
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>
    </div>
  );
}
