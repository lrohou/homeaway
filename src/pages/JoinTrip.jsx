import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

export default function JoinTrip() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState('');
  const [tripId, setTripId] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated) {
      // Store token in session to rejoin after login
      sessionStorage.setItem('join_token', token);
      navigate('/login?callback=join');
      return;
    }

    const join = async () => {
      try {
        const response = await api.members.join(token);
        setTripId(response.tripId);
        setStatus('success');
        sessionStorage.removeItem('join_token');
      } catch (err) {
        setError(err.message || "Impossible de rejoindre ce voyage. Le lien est peut-être expiré.");
        setStatus('error');
      }
    };

    join();
  }, [token, isAuthenticated, isLoadingAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            🌍 Home Away
          </CardTitle>
          <CardDescription>Invitation au voyage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Vérification de votre invitation...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">C'est bon !</h3>
              <p className="text-muted-foreground mb-6">
                Vous avez rejoint le voyage avec succès. Vous pouvez maintenant collaborer avec l'équipe.
              </p>
              <Button asChild className="w-full">
                <Link to={`/trip/${tripId}/planning`}>
                  Voir le voyage
                </Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Oops !</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
