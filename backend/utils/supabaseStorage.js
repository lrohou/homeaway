import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase credentials not found. File uploads will fail.');
}

/**
 * Uploade un fichier vers Supabase Storage et retourne son URL publique.
 * @param {Object} file - L'objet fichier venant de multer (req.file)
 * @param {string} folder - Le sous-dossier (ex: 'photos', 'messages', 'documents')
 * @returns {Promise<string>} L'URL publique du fichier
 */
export async function uploadToSupabase(file, folder = 'misc') {
  if (!supabase) {
    throw new Error("Supabase is not configured. Missing environment variables.");
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const fileName = `${folder}/${uniqueSuffix}${ext}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
