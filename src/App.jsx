import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import TripLayout from '@/components/layout/TripLayout';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NewTrip from '@/pages/NewTrip';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import JoinTrip from '@/pages/JoinTrip';
import Community from '@/pages/Community';
import CommunityTripView from '@/pages/CommunityTripView';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "562696376234-vuvan30oooeg5o0ma16gce5ugim9ol90.apps.googleusercontent.com";
import TripPlanning from '@/pages/trip/TripPlanning';
import TripDocument from '@/pages/trip/TripDocument';
import TripMap from '@/pages/trip/TripMap';
import TripExpenses from '@/pages/trip/TripExpenses';
import TripSettings from '@/pages/trip/TripSettings';
import TripAccommodations from '@/pages/trip/TripAccommodations';
import TripTransports from '@/pages/trip/TripTransports';
import TripActivities from '@/pages/trip/TripActivities';
import TripChat from '@/pages/trip/TripChat';
import TripMembers from '@/pages/trip/TripMembers';
import GlobalMap from '@/pages/GlobalMap';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join/:token" element={<JoinTrip />} />

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-trip" element={<NewTrip />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/trip/:sharedTripId" element={<CommunityTripView />} />
          <Route path="/global-map" element={<GlobalMap />} />
          <Route path="/trip/:tripId" element={<TripLayout />}>
            <Route path="planning" element={<TripPlanning />} />
            <Route path="documents" element={<TripDocument />} />
            <Route path="map" element={<div />} />
            <Route path="expenses" element={<TripExpenses />} />
            <Route path="accommodations" element={<TripAccommodations />} />
            <Route path="transports" element={<TripTransports />} />
            <Route path="activities" element={<TripActivities />} />
            <Route path="chat" element={<TripChat />} />
            <Route path="members" element={<TripMembers />} />
            <Route path="settings" element={<TripSettings />} />
          </Route>
        </Route>
      ) : (
        <Route path="/" element={<Navigate to="/login" replace />} />
      )}

      {/* Fallback */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  )
}

export default App