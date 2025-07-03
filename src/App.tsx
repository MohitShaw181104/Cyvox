import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/navbar';
import { HomePage } from '@/pages/home';
import { RecordsPage } from '@/pages/records';    
import { ProtectedRoute } from '@/components/protected-routes';
import { ComplaintFormPage } from '@/pages/complaint-form';
import { NotFoundPage } from '@/pages/not-found';
import { RegisterOnAuth } from "./components/register-on-auth"; 


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const hasValidClerkKey = PUBLISHABLE_KEY && 
  PUBLISHABLE_KEY !== 'your_clerk_publishable_key_here' && 
  PUBLISHABLE_KEY.startsWith('pk_');

function AppContent() {
  return (
    <Routes>
      {/* 404 Not Found Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-background flex flex-col">
            <NotFoundPage />
            <Toaster />
          </div>
        }
      />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-background pt-16">
            <Navbar />
            <HomePage />
            <Toaster />
          </div>
        }
      />
      <Route
        path="/complaint-form"
        element={
          <div className="min-h-screen bg-background pt-16">
            <Navbar />
            <ProtectedRoute>
            <ComplaintFormPage />
            </ProtectedRoute>
            <Toaster />
          </div>
        }
      />
      <Route
        path="/records"
        element={
          hasValidClerkKey ? (
            <div className="min-h-screen bg-background pt-16">
              <Navbar />
              <ProtectedRoute>
                <RecordsPage />
              </ProtectedRoute>
              <Toaster />
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8 min-h-screen bg-background pt-16">
              <Navbar />
              <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  Authentication Setup Required
                </h2>
                <p className="text-yellow-700 text-sm">
                  To access protected routes, please set up your Clerk publishable key in the .env file.
                </p>
              </div>
              <Toaster />
            </div>
          )
        }
      />
    </Routes>
  );
}

function App() {
  // If we don't have a valid Clerk key, render without ClerkProvider
  // if (!hasValidClerkKey) {
  //   return (
  //     <ThemeProvider defaultTheme="system" storageKey="voice-app-theme">
  //       <Router>
  //         <AppContent />
  //       </Router>
  //     </ThemeProvider>
  //   );
  // }

  // If we have a valid key, use ClerkProvider
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider defaultTheme="system" storageKey="voice-app-theme">
        <Router>
          <RegisterOnAuth />
          <AppContent />
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;