
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class SafeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold mb-2 text-red-400">Oyun Çöktü (Game Crashed)</h1>
          <p className="max-w-md text-gray-400 mb-6">
            Beklenmedik bir hata oluştu. Lütfen bu hatayı geliştiriciye bildirin.
          </p>
          
          <div className="bg-gray-900 p-4 rounded-md border border-gray-800 w-full max-w-2xl overflow-auto text-left mb-6 max-h-[300px]">
            <code className="text-red-300 font-mono text-sm block mb-2">
              {this.state.error && this.state.error.toString()}
            </code>
            <pre className="text-gray-500 text-xs font-mono whitespace-pre-wrap">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>

          <Button 
            variant="destructive" 
            onClick={() => window.location.href = "/"}
          >
            Ana Menüye Dön
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
