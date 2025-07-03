import { Siren, Upload, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent
// } from '@/components/ui/dialog';

export function HeroSection() {
  return (
    
    <div className="text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          CyVox
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload, record, and report voice transcriptions with ease.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 text-center bg-background/50 backdrop-blur-lg border border-white/10 hover:shadow-lg transition-all duration-300 relative before:absolute before:w-[110%] before:h-[110%] before:-z-10 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-rose-500/5 dark:before:bg-transparent before:blur-xl before:transform-gpu hover:before:bg-rose-500/8 dark:hover:before:bg-transparent">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Easy Upload</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop your audio files or browse to upload
          </p>
        </Card>

        <a
          href="/CyberPolice_Details.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Card className="p-6 text-center bg-background/50 backdrop-blur-lg border border-white/10 hover:shadow-lg transition-all duration-300 relative before:absolute before:w-[110%] before:h-[110%] before:-z-10 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-rose-500/5 dark:before:bg-transparent before:blur-xl before:transform-gpu hover:before:bg-rose-500/8 dark:hover:before:bg-transparent cursor-pointer">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Siren className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Cyber Police Details</h3>
            <p className="text-sm text-muted-foreground">
              You can contact the cyber police using the details provided in the PDF.
            </p>
            <p className="text-xs mt-2 text-blue-500 underline">View Cyber Police Details PDF</p>
          </Card>
        </a>

        <Card className="p-6 text-center bg-background/50 backdrop-blur-lg border border-white/10 hover:shadow-lg transition-all duration-300 relative before:absolute before:w-[110%] before:h-[110%] before:-z-10 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-rose-500/5 dark:before:bg-transparent before:blur-xl before:transform-gpu hover:before:bg-rose-500/8 dark:hover:before:bg-transparent">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Fast Processing</h3>
          <p className="text-sm text-muted-foreground">
            Quick upload and processing with real-time feedback
          </p>
        </Card>
      </div>
    </div>
  );
}