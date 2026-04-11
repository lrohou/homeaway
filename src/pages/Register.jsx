import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle2, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png'
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateStep1 = () => {
    if (!name.trim()) return setError('Le nom est requis');
    if (!email.trim() || !email.includes('@')) return setError('Email invalide');
    if (password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères');
    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas');
    setError('');
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setIsLoading(true);
      try {
        await api.auth.sendCode(email);
        setStep(3);
        setError('');
      } catch (err) {
        setError(err.message || 'Échec de l\'envoi du code');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step < 3) return handleNextStep();
    
    setError('');
    setIsLoading(true);

    try {
      await register(email, password, name, selectedAvatar, verificationCode);
      setSuccess('Compte créé avec succès ! Redirection...');
      
      const joinToken = sessionStorage.getItem('join_token');
      setTimeout(() => {
        if (joinToken) {
          navigate(`/join/${joinToken}`);
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Échec de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold font-display">🌍 Home Away</CardTitle>
          <CardDescription>
            {step === 1 && "Commencez votre aventure"}
            {step === 2 && "Choisissez votre avatar"}
            {step === 3 && "Vérifiez votre email"}
          </CardDescription>
          
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="grid grid-cols-5 gap-3 py-4">
                {AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative rounded-full p-1 transition-all hover:scale-110 ${selectedAvatar === url ? 'ring-2 ring-primary bg-primary/10' : 'bg-muted'}`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={url} />
                      <AvatarFallback>A{idx}</AvatarFallback>
                    </Avatar>
                    {selectedAvatar === url && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Vérifiez vos messages</h4>
                  <p className="text-sm text-muted-foreground">Un code à 6 chiffres a été envoyé à {email}</p>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-bold h-14"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <Button type="button" variant="link" className="text-xs" onClick={handleNextStep}>
                  Renvoyer le code
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={isLoading || (step === 3 && verificationCode.length !== 6)}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                  <>
                    {step === 3 ? "Terminer" : "Suivant"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {step === 1 && (
              <div className="text-center text-sm pt-4">
                <span className="text-muted-foreground">Déjà un compte ? </span>
                <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
                  Se connecter
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
