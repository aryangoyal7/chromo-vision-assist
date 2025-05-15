
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ClassificationResultsProps {
  segments: Array<{id: number, image: string, status: string}>;
}

// Mock classification function - would be replaced with actual ML model in production
const mockClassifyChromosomes = (segments: Array<{id: number, image: string, status: string}>) => {
  // In a real application, this would call a classification model API
  if (segments.length === 0) return [];
  
  const chromosomeTypes = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", 
    "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"
  ];
  
  // Simulate classification results
  return segments.map((segment, index) => ({
    ...segment,
    type: chromosomeTypes[Math.min(index, chromosomeTypes.length - 1)],
    confidence: Math.round((0.7 + Math.random() * 0.3) * 100) / 100, // Random confidence between 70-100%
    abnormalities: Math.random() > 0.8 ? ["Structural variation detected"] : []
  }));
};

// This is just a mock component - in a real app, this would be a proper component
const ClassificationResults: React.FC<{originalImage: string}> = ({ originalImage }) => {
  const [classified, setClassified] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Mock segments based on original image
  const segments = originalImage ? 
    Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      image: originalImage,
      status: 'segmented'
    })) : [];
  
  useEffect(() => {
    if (originalImage && segments.length > 0) {
      // Reset state when new image is uploaded
      setClassified([]);
      setIsComplete(false);
    }
  }, [originalImage]);
  
  const handleClassify = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const classifiedResults = mockClassifyChromosomes(segments);
      setClassified(classifiedResults);
      setIsLoading(false);
      setIsComplete(true);
      
      // Check for any abnormalities to alert the clinician
      const abnormalChromosomes = classifiedResults.filter(chr => chr.abnormalities.length > 0);
      if (abnormalChromosomes.length > 0) {
        toast({
          variant: "destructive",
          title: "Abnormalities Detected",
          description: `${abnormalChromosomes.length} chromosome(s) show potential abnormalities.`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No abnormalities detected in the karyotype analysis.",
        });
      }
    }, 3000);
  };
  
  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "The karyotype analysis report has been generated and saved.",
    });
  };
  
  if (!originalImage || segments.length === 0) {
    return (
      <Card className="w-full karyotype-card min-h-[300px]">
        <CardHeader>
          <CardTitle>Classification Results</CardTitle>
          <CardDescription>
            Upload a metaphase image to perform chromosome classification
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground italic">No segmentation data available yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full karyotype-card">
      <CardHeader>
        <CardTitle>Classification Results</CardTitle>
        <CardDescription>
          {isComplete 
            ? "Classification complete. Review the results below." 
            : isLoading 
              ? "Classifying chromosomes and detecting abnormalities..." 
              : "Click Classify to begin chromosome type identification"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-24 w-12 mb-2" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : isComplete ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {classified.map((chromosome) => (
              <div 
                key={chromosome.id} 
                className={`labeled-chromosome ${
                  chromosome.abnormalities.length > 0 ? 'bg-red-50 border border-red-200' : ''
                }`}
              >
                <div className="h-24 w-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-2">
                  <img 
                    src={chromosome.image} 
                    alt={`Chromosome ${chromosome.type}`}
                    className="h-full object-contain"
                    style={{ maxWidth: "none", height: "100%", opacity: 0.7 }}
                  />
                </div>
                <span className="text-sm font-medium">Type: {chromosome.type}</span>
                <span className="text-xs text-muted-foreground">
                  Confidence: {(chromosome.confidence * 100).toFixed(0)}%
                </span>
                {chromosome.abnormalities.length > 0 && (
                  <span className="text-xs text-red-500 mt-1 font-medium">
                    ⚠️ Abnormality detected
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">
              Segmentation complete. Ready to classify chromosomes.
            </p>
            <Button 
              className="karyotype-button"
              onClick={handleClassify}
            >
              Start Classification
            </Button>
          </div>
        )}
      </CardContent>
      {isComplete && (
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setClassified([]);
              setIsComplete(false);
            }}
          >
            Reset
          </Button>
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ClassificationResults;
