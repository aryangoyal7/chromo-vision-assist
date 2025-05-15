
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SegmentationDisplayProps {
  originalImage: string;
}

// This would be replaced with actual segmentation processing
const mockSegmentChromosomes = (originalImage: string) => {
  // In a real application, this would call a segmentation model API
  // For demo purposes, we'll mock 23 chromosome segments
  if (!originalImage) return [];
  
  // Simulate asynchronous segmentation process
  return Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    image: originalImage, // In real app, this would be the segment image
    status: 'processing'
  }));
};

const SegmentationDisplay: React.FC<SegmentationDisplayProps> = ({ originalImage }) => {
  const [segments, setSegments] = useState<Array<{id: number, image: string, status: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (originalImage) {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const segmentedChromosomes = mockSegmentChromosomes(originalImage);
        setSegments(segmentedChromosomes);
        setIsLoading(false);
      }, 2000);
    } else {
      setSegments([]);
    }
  }, [originalImage]);
  
  if (!originalImage && segments.length === 0) {
    return (
      <Card className="w-full karyotype-card min-h-[300px]">
        <CardHeader>
          <CardTitle>Chromosome Segmentation</CardTitle>
          <CardDescription>
            Upload a metaphase image to see the segmentation results
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground italic">No image uploaded yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full karyotype-card">
      <CardHeader>
        <CardTitle>Chromosome Segmentation</CardTitle>
        <CardDescription>
          {isLoading 
            ? "Processing image and extracting chromosomes..." 
            : `${segments.length} chromosomes have been identified and segmented`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-20 w-8 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {segments.map((segment) => (
              <div 
                key={segment.id} 
                className="flex flex-col items-center p-2 bg-karyotype-blue rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
              >
                <div className="h-20 w-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-2">
                  <img 
                    src={segment.image} 
                    alt={`Chromosome ${segment.id}`}
                    className="h-full object-contain"
                    // In a real app, this would be cropped to show just one chromosome
                    style={{ maxWidth: "none", height: "100%", opacity: 0.7 }}
                  />
                </div>
                <span className="text-sm font-medium">Chr {segment.id}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SegmentationDisplay;
