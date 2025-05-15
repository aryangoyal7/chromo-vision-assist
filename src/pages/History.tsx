
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data for history - in a real app this would come from a database
const mockHistoryData = [
  {
    id: "KT-2025-0512",
    patientId: "P-78431",
    date: "May 12, 2025",
    status: "Complete",
    abnormalities: false,
    analysisType: "Standard Karyotype"
  },
  {
    id: "KT-2025-0510",
    patientId: "P-65122",
    date: "May 10, 2025",
    status: "Complete",
    abnormalities: true,
    analysisType: "Standard Karyotype"
  },
  {
    id: "KT-2025-0505",
    patientId: "P-92135",
    date: "May 5, 2025",
    status: "Complete",
    abnormalities: false,
    analysisType: "High-Resolution"
  }
];

const History = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-karyotype-gray flex flex-col">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <Button 
              className="karyotype-button"
              onClick={() => navigate('/analysis')}
            >
              New Analysis
            </Button>
          </div>
          
          <Card className="w-full karyotype-card">
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>
                View and manage your recent karyotype analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">ID</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Patient ID</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Date</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Abnormalities</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHistoryData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-karyotype-gray/50 cursor-pointer">
                        <td className="py-3 px-4">{item.id}</td>
                        <td className="py-3 px-4">{item.patientId}</td>
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.abnormalities ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Detected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              None
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{item.analysisType}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Report</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default History;
