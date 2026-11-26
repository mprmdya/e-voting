import logoTsu from '../img/LOGO-TSU-png-1536x751.png'

export const TSU_LOGO_URL = logoTsu

// NOTE:
//   The list of admin e‑mail addresses is **no longer hard‑coded**.
//   It is loaded at runtime from the protected Firestore collection
//   `config/admins` (see src/App.tsx).  This prevents the admin list
//   from being shipped in the public JavaScript bundle.
