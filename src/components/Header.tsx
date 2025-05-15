
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">KaryoType Assistant</h1>
        </div>
        <nav className="flex space-x-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate("/analysis")}
            className="text-muted-foreground hover:text-foreground"
          >
            New Analysis
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate("/history")} 
            className="text-muted-foreground hover:text-foreground"
          >
            History
          </Button>
        </nav>
        <div>
          <Button variant="outline" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium">Dr</span>
            </div>
            <span>Dr. Smith</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
