"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ProviderProfileImagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!dataUrl) throw new Error("Select an image first");
      const res = await apiRequest("POST", "/api/upload/avatar", { image: dataUrl });
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], (old: any) => ({ ...(old || {}), profileImageUrl: data.url }));
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
      toast({ title: "Profile image updated" });
      router.push("/provider/profile");
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const onSelectFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setPreview(value);
      setDataUrl(value);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="portal-page">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="portal-header mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/provider/profile")} data-testid="button-provider-image-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="portal-title">Update profile image</h1>
        </div>

        <Card className="portal-card">
          <div className="flex justify-center">
            <Avatar className="h-28 w-28">
              <AvatarImage src={preview || user?.profileImageUrl || undefined} alt={user?.firstName || "Provider"} />
              <AvatarFallback>{user?.firstName?.[0] || "P"}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} data-testid="button-provider-choose-image">
              <Camera className="h-4 w-4 mr-1.5" />
              Choose Image
            </Button>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!dataUrl || uploadMutation.isPending}
              data-testid="button-provider-upload-image"
            >
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
              Upload
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelectFile(file);
              e.currentTarget.value = "";
            }}
          />
        </Card>
      </div>
    </div>
  );
}
