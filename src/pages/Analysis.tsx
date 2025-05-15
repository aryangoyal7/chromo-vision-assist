
import React, { useState } from 'react';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import SegmentationDisplay from '@/components/SegmentationDisplay';
import ClassificationResults from '@/components/ClassificationResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Analysis = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  const handleImageUploaded = (imageData: string) => {
    setUploadedImage(imageData);
    if (imageData) {
      // Automatically move to the next tab when an image is uploaded
      setTimeout(() => setActiveTab("segmentation"), 500);
    }
  };
  
  return (
    <div className="min-h-screen bg-karyotype-gray flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Karyotype Analysis</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                1. Upload Image
              </TabsTrigger>
              <TabsTrigger 
                value="segmentation"
                disabled={!uploadedImage} 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                2. Segmentation
              </TabsTrigger>
              <TabsTrigger 
                value="classification"
                disabled={!uploadedImage}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
              >
                3. Classification
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="animate-fade-in">
              <div className="grid grid-cols-1 gap-8">
                <ImageUploader onImageUploaded={handleImageUploaded} />
                
                {uploadedImage && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setActiveTab("segmentation")}
                      className="karyotype-button"
                    >
                      Next: Segmentation
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="segmentation" className="animate-fade-in">
              <div className="grid grid-cols-1 gap-8">
                <SegmentationDisplay originalImage={uploadedImage} />
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setActiveTab("classification")}
                    className="karyotype-button"
                  >
                    Next: Classification
                  </button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="classification" className="animate-fade-in">
              <ClassificationResults originalImage={uploadedImage} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
