// ── Authentification ──────────────────────────────────────────────────────
export interface LoginData {
  username: string;
  password: string;
  captcha_key: string;
  captcha_value: string;
}

export interface InscriptionData {
  matricule: string;
  email: string;
  password: string;
  password_confirm: string;
  captcha_key: string;
  captcha_value: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ── Electeur ──────────────────────────────────────────────────────────────
export interface Electeur {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere: string;
  niveau: string;
  statut: 'EN_ATTENTE' | 'ELIGIBLE' | 'SUSPENDU';
  a_vote: boolean;
  date_vote: string | null;
  created_at: string;
}

// ── Scrutin ───────────────────────────────────────────────────────────────
export interface Scrutin {
  id: number;
  titre: string;
  description: string | null;
  date_debut: string;
  date_fin: string;
  statut: 'BROUILLON' | 'OUVERT' | 'CLOTURE';
  filiere_cible: string | null;
  niveau_cible: string | null;
  nb_eligibles: number;
  nb_candidats: number;
  created_at: string;
}

// ── Candidat ──────────────────────────────────────────────────────────────
export interface Candidat {
  id: number;
  scrutin: number;
  nom: string;
  prenom: string | null;
  photo: string | null;
  programme: string | null;
  est_vote_blanc: boolean;
  created_at: string;
}

// ── Vote ──────────────────────────────────────────────────────────────────
export interface VotePayload {
  scrutin_id: number;
  candidat_id: number;
}

export interface VoteRecu {
  recu: string;
  scrutin_id: number;
}

// ── Resultats ─────────────────────────────────────────────────────────────
export interface ResultatCandidat {
  candidat_id: number;
  nom: string;
  prenom: string | null;
  est_vote_blanc: boolean;
  nb_voix: number;
  pourcentage: number;
}

export interface Resultats {
  scrutin_id: number;
  titre: string;
  statut: string;
  nb_eligibles: number;
  nb_votants: number;
  nb_abstentions: number;
  taux_participation: number;
  resultats: ResultatCandidat[];
}

// ── Audit ─────────────────────────────────────────────────────────────────
export interface LogAudit {
  id: number;
  action: string;
  acteur: number | null;
  acteur_nom: string | null;
  details: Record<string, unknown>;
  hash_precedent: string;
  hash_courant: string;
  created_at: string;
}

// ── API Response ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  code?: string;
}

// ── Captcha ───────────────────────────────────────────────────────────────
export interface CaptchaData {
  captcha_key: string;
  captcha_image_url: string;
}