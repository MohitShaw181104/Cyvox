import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2 text-foreground">Page Not Found</h2>
      <p className="mb-6 text-muted-foreground max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Button asChild variant="default" size="lg">
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
}
