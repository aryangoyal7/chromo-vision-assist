
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUploaded: (imageData: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.includes('image')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageData = e.target.result as string;
        setPreview(imageData);
        onImageUploaded(imageData);
        toast({
          title: "Image uploaded",
          description: "Your metaphase image has been uploaded successfully.",
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <Card className="w-full karyotype-card">
      <CardHeader>
        <CardTitle>Upload Metaphase Image</CardTitle>
        <CardDescription>
          Upload a high-quality metaphase image for chromosome analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {preview ? (
            <div className="w-full">
              <img 
                src={preview} 
                alt="Metaphase Preview" 
                className="max-h-64 mx-auto rounded-md object-contain mb-4"
              />
              <p className="text-sm text-center text-muted-foreground">
                Click or drag to upload a different image
              </p>
            </div>
          ) : (
            <>
              <div className="h-16 w-16 mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="h-8 w-8 text-secondary-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">Drop your image here or click to browse</p>
              <p className="text-sm text-muted-foreground text-center">
                Supports JPG, PNG, TIFF formats up to 20MB
              </p>
            </>
          )}
          <input 
            type="file" 
            id="file-input" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileSelect} 
          />
        </div>
        {preview && (
          <div className="flex justify-end mt-4">
            <Button
              className="karyotype-button"
              onClick={() => {
                setPreview(null);
                onImageUploaded('');
              }}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
