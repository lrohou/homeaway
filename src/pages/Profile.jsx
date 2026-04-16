import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../api/apiClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { AlertCircle, LogOut, Mail, User, Calendar, Save, Trash2, Camera, Globe } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { toast } from "../components/ui/use-toast";

export default function Profile() {
  const { user, logout, isLoadingAuth } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/login');
    }
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || ''
      });
    }
  }, [user, isLoadingAuth, navigate]);

  const handleLogout = () => {
    logout(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await api.auth.updateMe(formData);
      setIsEditing(false);
      // We might need to refresh user context or just let it be if AuthContext handles it
      // For now, let's assume the user object in context needs refresh or is updated by some mechanism
      // If AuthContext has a refreshUser method, we'd call it here.
      // Since I don't see one, I'll recommend a window reload or just hope the session is updated.
      window.location.reload(); 
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.auth.deleteAccount();
      logout(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du compte');
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
          </div>
          <Button 
            variant={isEditing ? "ghost" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full"
          >
            {isEditing ? t('profile.cancel') : t('profile.edit')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-xl border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="shadow-xl border border-white/40 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-inner"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center border-4 border-white/20 backdrop-blur-md">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-xl font-bold h-auto py-1"
                    placeholder="Votre nom"
                  />
                ) : (
                  <CardTitle className="text-3xl text-white font-display mb-1">{user.name}</CardTitle>
                )}
                <p className="text-blue-100/80 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {t('profile.activeUser')}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="grid gap-6">
              {/* Email */}
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{t('profile.email')}</p>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Avatar URL (Only visible when editing) */}
              {isEditing && (
                <div className="flex items-center gap-4 group">
                  <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{t('profile.avatarUrl')}</p>
                    <Input
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://..."
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{t('profile.memberSince')}</p>
                  <p className="text-gray-900 font-medium lowercase">
                    {new Date(user.created_at || Date.now()).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-4 group mt-2 pt-2 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{t('profile.language')}</p>
                    <p className="text-gray-900 font-medium">{lang === 'fr' ? t('profile.langFr') : t('profile.langEn')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={lang === 'fr' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setLang('fr')}
                      className={`rounded-xl ${lang === 'fr' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 outline-slate-200 border-slate-200'} transition-all px-3`}
                    >
                      FR
                    </Button>
                    <Button 
                      variant={lang === 'en' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setLang('en')}
                      className={`rounded-xl ${lang === 'en' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 outline-slate-200 border-slate-200'} transition-all px-3`}
                    >
                      EN
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              {isEditing ? (
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 h-12"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('profile.save')}
                </Button>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex-1 rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 border-none"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('profile.logoutBtn')}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex-1 rounded-2xl h-12 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('profile.deleteAccount')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('profile.deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('profile.deleteDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">{t('profile.deleteCancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-rose-600 hover:bg-rose-700 rounded-xl"
                        >
                          {t('profile.deleteYes')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('profile.support')} <a href="mailto:support@homeaway.com" className="text-blue-600 hover:underline font-medium">{t('profile.contactSupport')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
