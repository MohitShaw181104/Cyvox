import { useState, useRef, useCallback,  } from 'react';
import { Upload, Mic, Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceUploadProps {
  onUploadComplete?: (file: File) => void;
}

export function VoiceUpload({ onUploadComplete }: VoiceUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      handleFileUpload(audioFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setTimeout(() => {
            onUploadComplete?.(file);
            setAudioUrl(URL.createObjectURL(file));
            toast({
              title: "Upload successful!",
              description: `${file.name} has been uploaded successfully.`,
            });
          }, 0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // useEffect(() => {
  //   if (uploadedFile && !isUploading) {
  //     onUploadComplete?.(uploadedFile);
  //     setUploadedFile(null);
  //   }
  // }, [uploadedFile, isUploading, onUploadComplete]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording error",
        description: "Could not start recording. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const clearRecording = () => {
    setRecordedAudio(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setUploadProgress(0);
    setIsUploading(false);
    //setUploadedFile(null);
  };

  // const uploadRecording = () => {
  //   if (recordedAudio) {
  //     const file = new File([recordedAudio], 'recording.wav', { type: 'audio/wav' });
  //     handleFileUpload(file);
  //   }
  // };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card
        className={cn(
          "relative p-4 border-2 border-dashed transition-colors",
          isDragOver ? "border-primary/50" : "border-muted-foreground/25",
          "hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {!recordedAudio && !audioUrl ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload or record your audio
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={clearRecording}
            >
              <X className="h-6 w-6" />
            </Button>
            {audioUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={playAudio}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
            )}
          </div>
        )}

        {isUploading && (
          <Progress value={uploadProgress} className="mt-2" />
        )}
        <audio ref={audioRef} src={audioUrl || ''} onEnded={() => setIsPlaying(false)} />
      </Card>
    </div>
  );
}