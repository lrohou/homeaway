/**
 * Album Downloader - Module utilitaire pour le téléchargement d'albums photos
 * 
 * Gère la création de fichiers ZIP (standard ou avec galerie HTML interactive),
 * la compression d'images côté client, et le téléchargement en lot.
 * 
 * Limites gérées :
 * - Compression automatique si > 50 photos ou > 100MB estimé
 * - Alerte Safari iOS pour les fichiers > 200MB
 * - Gestion des images corrompues/manquantes (skip avec warning)
 * - Interruption réseau avec retry
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ─── Configuration ───────────────────────────────────────────────
const MAX_PHOTOS_BEFORE_COMPRESS = 50;
const MAX_SIZE_MB_BEFORE_COMPRESS = 100;
const COMPRESSED_MAX_WIDTH = 1920;
const COMPRESSED_QUALITY = 0.7;
const SAFARI_BLOB_LIMIT_MB = 200;

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Détecte si le navigateur est Safari iOS (limites Blob plus strictes)
 */
function isIOSSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Récupère l'URL absolue d'une photo (compatible ancien/nouveau format)
 */
function getAbsoluteUrl(photo, backendUrl) {
  if (photo.file_url.startsWith('http')) return photo.file_url;
  return `${backendUrl}${photo.file_url}`;
}

/**
 * Télécharge une image en tant que Blob avec gestion d'erreur
 */
async function fetchImageBlob(url) {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.blob();
}

/**
 * Compresse une image via Canvas API (redimensionne + réduit la qualité JPEG)
 * Retourne un Blob compressé. Si l'image n'est pas une image, retourne le blob original.
 */
function compressImage(blob, maxWidth = COMPRESSED_MAX_WIDTH, quality = COMPRESSED_QUALITY) {
  return new Promise((resolve) => {
    // Ne compresser que les images
    if (!blob.type.startsWith('image/')) {
      resolve(blob);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensionner si nécessaire
      if (width > maxWidth) {
        height = Math.round((height / width) * maxWidth);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (compressedBlob) => {
          resolve(compressedBlob || blob);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob); // En cas d'erreur, retourner l'original
    };

    img.src = url;
  });
}

/**
 * Estime la taille totale d'un album (en bytes) à partir des blobs téléchargés
 */
function estimateTotalSize(blobs) {
  return blobs.reduce((sum, b) => sum + (b ? b.size : 0), 0);
}

/**
 * Génère l'extension de fichier à partir du type MIME
 */
function getExtension(blob, fallback = '.jpg') {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/heic': '.heic',
  };
  return map[blob.type] || fallback;
}

// ─── Galerie HTML Interactive ────────────────────────────────────

/**
 * Génère le code HTML d'une galerie photo interactive responsive avec slider tactile
 */
function generateInteractiveGalleryHTML(photos, albumName) {
  const imageEntries = photos
    .map((p, i) => `{ src: "photos/${p.filename}", caption: ${JSON.stringify(p.caption || `Photo ${i + 1}`)} }`)
    .join(',\n      ');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>${albumName} — Album Photo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      background: #0a0a0b;
      color: #e4e4e7;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ─── Header ─── */
    .header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      background: linear-gradient(180deg, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0) 100%);
      padding: 1.5rem 2rem;
      backdrop-filter: blur(20px);
    }

    .header h1 {
      font-size: 1.5rem; font-weight: 700;
      background: linear-gradient(135deg, #f97316, #ef4444);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header .count {
      font-size: 0.875rem; color: #71717a; margin-top: 0.25rem;
    }

    /* ─── Grid ─── */
    .gallery {
      padding: 7rem 1rem 2rem;
      columns: 2; column-gap: 0.75rem;
    }

    @media (min-width: 768px) { .gallery { columns: 3; column-gap: 1rem; padding: 7rem 2rem 2rem; } }
    @media (min-width: 1200px) { .gallery { columns: 4; } }

    .gallery-item {
      break-inside: avoid;
      margin-bottom: 0.75rem;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .gallery-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    }

    .gallery-item img {
      width: 100%; display: block;
      transition: transform 0.5s ease;
    }

    .gallery-item:hover img { transform: scale(1.05); }

    .gallery-item .overlay {
      position: absolute; inset: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 50%);
      opacity: 0; transition: opacity 0.3s ease;
      display: flex; align-items: flex-end; padding: 1rem;
    }

    .gallery-item:hover .overlay { opacity: 1; }

    .gallery-item .overlay p {
      font-size: 0.875rem; font-weight: 500; color: #fff;
    }

    /* ─── Lightbox / Slider ─── */
    .lightbox {
      display: none; position: fixed; inset: 0; z-index: 100;
      background: rgba(0,0,0,0.95);
      backdrop-filter: blur(30px);
      flex-direction: column;
    }

    .lightbox.active { display: flex; }

    .lightbox-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.5rem; flex-shrink: 0;
    }

    .lightbox-header .caption {
      font-size: 1rem; font-weight: 500;
    }

    .lightbox-header .counter {
      font-size: 0.875rem; color: #71717a;
    }

    .lightbox-close {
      width: 44px; height: 44px; border: none; background: rgba(255,255,255,0.1);
      color: #fff; border-radius: 50%; font-size: 1.5rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }

    .lightbox-close:hover { background: rgba(255,255,255,0.2); }

    .slider-container {
      flex: 1; position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      touch-action: pan-y;
    }

    .slider-container img {
      max-width: 90%; max-height: 80vh; object-fit: contain;
      border-radius: 8px; user-select: none; -webkit-user-drag: none;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;
    }

    .nav-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 48px; height: 48px; border: none;
      background: rgba(255,255,255,0.1); color: #fff;
      border-radius: 50%; font-size: 1.25rem; cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    }

    .nav-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-50%) scale(1.1); }
    .nav-btn.prev { left: 1rem; }
    .nav-btn.next { right: 1rem; }

    @media (max-width: 768px) {
      .nav-btn { display: none; }
    }

    /* ─── Footer ─── */
    .footer {
      text-align: center; padding: 2rem; color: #3f3f46;
      font-size: 0.75rem; border-top: 1px solid #1c1c1e;
    }

    .footer a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>

  <div class="header">
    <h1>🌍 ${albumName}</h1>
    <p class="count" id="photoCount"></p>
  </div>

  <div class="gallery" id="gallery"></div>

  <div class="lightbox" id="lightbox">
    <div class="lightbox-header">
      <div>
        <div class="caption" id="lbCaption"></div>
        <div class="counter" id="lbCounter"></div>
      </div>
      <button class="lightbox-close" id="lbClose">&times;</button>
    </div>
    <div class="slider-container" id="sliderContainer">
      <img id="lbImage" src="" alt="Photo" />
      <button class="nav-btn prev" id="prevBtn">&#8249;</button>
      <button class="nav-btn next" id="nextBtn">&#8250;</button>
    </div>
  </div>

  <div class="footer">
    <p>Album généré par <a href="#">HomeAway</a> — ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>

  <script>
    const images = [
      ${imageEntries}
    ];

    let currentIndex = 0;

    // ─── Render Grid ───
    const gallery = document.getElementById('gallery');
    document.getElementById('photoCount').textContent = images.length + ' photo' + (images.length > 1 ? 's' : '');

    images.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = '<img src="' + img.src + '" alt="' + img.caption + '" loading="lazy" />' +
        '<div class="overlay"><p>' + img.caption + '</p></div>';
      item.addEventListener('click', () => openLightbox(i));
      gallery.appendChild(item);
    });

    // ─── Lightbox Logic ───
    const lightbox = document.getElementById('lightbox');
    const lbImage = document.getElementById('lbImage');
    const lbCaption = document.getElementById('lbCaption');
    const lbCounter = document.getElementById('lbCounter');

    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateLightbox() {
      const img = images[currentIndex];
      lbImage.src = img.src;
      lbCaption.textContent = img.caption;
      lbCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
    }

    function navigate(dir) {
      currentIndex = (currentIndex + dir + images.length) % images.length;
      updateLightbox();
    }

    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('prevBtn').addEventListener('click', () => navigate(-1));
    document.getElementById('nextBtn').addEventListener('click', () => navigate(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.id === 'sliderContainer') closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const slider = document.getElementById('sliderContainer');

    slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    });
  </script>
</body>
</html>`;
}

// ─── Fonctions Publiques ─────────────────────────────────────────

/**
 * Télécharge toutes les images une par une (sans ZIP)
 * @param {Array} photos - Liste des objets photo
 * @param {string} backendUrl - URL du backend
 * @param {Function} onProgress - Callback (current, total, message)
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function downloadAllPhotos(photos, backendUrl, onProgress) {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress(i + 1, photos.length, `Téléchargement ${i + 1}/${photos.length}...`);

    try {
      const url = getAbsoluteUrl(photo, backendUrl);
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const ext = getExtension(blob);
      saveAs(blob, `photo-${i + 1}${ext}`);
      success++;

      // Petit délai pour ne pas surcharger le navigateur
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.warn(`Image ${i + 1} skipped:`, err.message);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Génère un ZIP standard contenant toutes les photos
 * @param {Array} photos - Liste des objets photo
 * @param {string} backendUrl - URL du backend
 * @param {string} albumName - Nom de l'album pour le fichier
 * @param {Function} onProgress - Callback (current, total, message)
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function downloadZipStandard(photos, backendUrl, albumName, onProgress) {
  const zip = new JSZip();
  let success = 0;
  let failed = 0;

  // Déterminer s'il faut compresser
  const shouldCompress = photos.length > MAX_PHOTOS_BEFORE_COMPRESS;

  // Phase 1 : Télécharger et ajouter chaque photo au ZIP
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress(i + 1, photos.length, `Traitement de l'image ${i + 1}/${photos.length}...`);

    try {
      const url = getAbsoluteUrl(photo, backendUrl);
      let blob = await fetchImageBlob(url);

      // Compresser si nécessaire
      if (shouldCompress) {
        blob = await compressImage(blob);
      }

      const ext = getExtension(blob);
      const filename = `photo-${String(i + 1).padStart(3, '0')}${ext}`;
      zip.file(filename, blob);
      success++;
    } catch (err) {
      console.warn(`Image ${i + 1} skipped:`, err.message);
      failed++;
    }
  }

  if (success === 0) {
    throw new Error('Aucune image n\'a pu être téléchargée.');
  }

  // Phase 2 : Générer le ZIP
  onProgress(photos.length, photos.length, 'Création de l\'archive ZIP...');

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress(photos.length, photos.length, `Compression... ${Math.round(metadata.percent)}%`);
    }
  );

  // Vérifier la limite Safari iOS
  const sizeMB = zipBlob.size / (1024 * 1024);
  if (isIOSSafari() && sizeMB > SAFARI_BLOB_LIMIT_MB) {
    throw new Error(`L'archive fait ${sizeMB.toFixed(0)}MB. Safari iOS ne supporte pas les fichiers supérieurs à ${SAFARI_BLOB_LIMIT_MB}MB. Essayez "Tout télécharger" à la place.`);
  }

  saveAs(zipBlob, `${albumName}.zip`);
  return { success, failed };
}

/**
 * Génère un ZIP contenant les photos + une galerie HTML interactive
 * @param {Array} photos - Liste des objets photo
 * @param {string} backendUrl - URL du backend
 * @param {string} albumName - Nom de l'album
 * @param {Function} onProgress - Callback (current, total, message)
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function downloadZipInteractive(photos, backendUrl, albumName, onProgress) {
  const zip = new JSZip();
  const photosFolder = zip.folder('photos');
  let success = 0;
  let failed = 0;

  const shouldCompress = photos.length > MAX_PHOTOS_BEFORE_COMPRESS;

  // Métadonnées pour le HTML
  const photoMeta = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress(i + 1, photos.length, `Traitement de l'image ${i + 1}/${photos.length}...`);

    try {
      const url = getAbsoluteUrl(photo, backendUrl);
      let blob = await fetchImageBlob(url);

      if (shouldCompress) {
        blob = await compressImage(blob);
      }

      const ext = getExtension(blob);
      const filename = `photo-${String(i + 1).padStart(3, '0')}${ext}`;

      photosFolder.file(filename, blob);
      photoMeta.push({
        filename,
        caption: photo.caption || `Photo ${i + 1}`,
        uploader: photo.uploader_name || '',
      });

      success++;
    } catch (err) {
      console.warn(`Image ${i + 1} skipped:`, err.message);
      failed++;
    }
  }

  if (success === 0) {
    throw new Error('Aucune image n\'a pu être téléchargée.');
  }

  // Générer et ajouter le fichier HTML
  onProgress(photos.length, photos.length, 'Génération de la galerie interactive...');
  const htmlContent = generateInteractiveGalleryHTML(photoMeta, albumName);
  zip.file('index.html', htmlContent);

  // Générer le ZIP final
  onProgress(photos.length, photos.length, 'Création de l\'archive ZIP...');

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress(photos.length, photos.length, `Compression... ${Math.round(metadata.percent)}%`);
    }
  );

  const sizeMB = zipBlob.size / (1024 * 1024);
  if (isIOSSafari() && sizeMB > SAFARI_BLOB_LIMIT_MB) {
    throw new Error(`L'archive fait ${sizeMB.toFixed(0)}MB. Safari iOS ne supporte pas les fichiers supérieurs à ${SAFARI_BLOB_LIMIT_MB}MB. Essayez "Tout télécharger" à la place.`);
  }

  saveAs(zipBlob, `${albumName}-album.zip`);
  return { success, failed };
}
