import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploaderProps {
  onPhotosUploaded: (urls: string[]) => void;
  existingPhotos?: string[];
}

export const PhotoUploader = ({ onPhotosUploaded, existingPhotos = [] }: PhotoUploaderProps) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = event.target.files;
      if (!files) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('leftover-photos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('leftover-photos')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      onPhotosUploaded(newPhotos);

      toast({
        title: "Photos téléchargées",
        description: "Vos photos ont été téléchargées avec succès.",
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement des photos.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(newPhotos);
    onPhotosUploaded(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        {photos.map((photo, index) => (
          <div key={index} className="relative">
            <img
              src={photo}
              alt={`Reste alimentaire ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemovePhoto(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2"
          disabled={uploading}
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Téléchargement...' : 'Télécharger des photos'}
        </Button>
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};