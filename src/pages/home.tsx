// import { VoiceUpload } from '@/components/voice-upload';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  // const handleUploadComplete = (file: File) => {
  //   console.log('Upload complete:', file.name);
  //   // Here you would typically send the file to your backend
  // };

  return (
    <div className="container py-12 space-y-16">
      <HeroSection />
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Register Your Complaint</h2>
        <Button 
          onClick={() => navigate('/complaint-form')}
          size="lg"
          className="mx-auto"
        >
          Register Your Complaint
        </Button>
      </div>
    </div>
  );
}