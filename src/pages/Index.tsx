
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-karyotype-gray flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Welcome to KaryoType Assistant</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="karyotype-card">
              <CardHeader>
                <CardTitle>Quick Analysis</CardTitle>
                <CardDescription>
                  Start a new karyotype analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upload a metaphase image for automated chromosome segmentation and classification.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="karyotype-button w-full"
                  onClick={() => navigate('/analysis')}
                >
                  Start New Analysis
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="karyotype-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  View your recent analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                    <span>KT-2025-0512</span>
                    <span className="text-sm text-muted-foreground">May 12, 2025</span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                    <span>KT-2025-0510</span>
                    <span className="text-sm text-muted-foreground">May 10, 2025</span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                    <span>KT-2025-0505</span>
                    <span className="text-sm text-muted-foreground">May 5, 2025</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/history')}
                >
                  View All History
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="karyotype-card">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Model performance statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Segmentation Model</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Classification Model</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Processing Time</span>
                    <span className="text-sm font-medium">4.2 seconds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accuracy (last month)</span>
                    <span className="text-sm font-medium">98.7%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  System Report
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card className="karyotype-card mb-6">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                The automated karyotyping process explained
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="h-16 w-16 rounded-full bg-karyotype-blue flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload Metaphase Image</h3>
                  <p className="text-muted-foreground">
                    Upload a high-quality metaphase spread image from your microscopy system.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="h-16 w-16 rounded-full bg-karyotype-teal flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Automated Segmentation</h3>
                  <p className="text-muted-foreground">
                    Our AI model identifies and segments individual chromosomes from the metaphase spread.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="h-16 w-16 rounded-full bg-karyotype-green flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Classification & Analysis</h3>
                  <p className="text-muted-foreground">
                    Each chromosome is classified and analyzed for potential abnormalities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
