import greenit from '../data/referentiel-greenit.json';
import wsg from '../data/referentiel-wsg.json';

/**
 * The two sustainability references the blog audits itself against, read from
 * JSON so the page and the Markdown files cannot disagree.
 *
 * The JSON is the source; `npm run docs:referentiels` regenerates
 * REFERENTIEL-GREENIT.md and REFERENTIEL-W3C-WSG.md from it. Keeping the prose
 * and the page as two hand-maintained copies is how the pagination came to
 * show nine cards on one page and ten on the next, and an audit that
 * contradicts itself is worse than no audit.
 */
export type Statut = 'OK' | 'PART' | 'KO' | 'NA' | 'ORG';

export interface Critere {
  /** Rule number for Green IT, count of success criteria for the WSG. */
  ref: string;
  titre: string;
  url?: string;
  statut: Statut;
  comment: string;
}

export interface Groupe {
  nom: string;
  criteres: Critere[];
}

export interface Referentiel {
  id: string;
  nom: string;
  source: string;
  version: string;
  evalue_le: string;
  unite: string;
  note: string;
  groupes: Groupe[];
}

export const REFERENTIELS: Referentiel[] = [greenit as Referentiel, wsg as Referentiel];

/**
 * Reader-facing labels. `ORG` exists because nine WSG guidelines judge the
 * company and not the site: calling them non-applicable would suggest the
 * question does not arise, which is not the same thing.
 */
export const STATUTS: Record<Statut, { label: string; court: string }> = {
  OK: { label: 'Respecté', court: 'Respectés' },
  PART: { label: 'Partiel', court: 'Partiels' },
  KO: { label: 'Non respecté', court: 'Non respectés' },
  NA: { label: 'Sans objet', court: 'Sans objet' },
  ORG: { label: 'Relève de zatsit', court: 'Relèvent de zatsit' },
};

export interface Comptes {
  parStatut: Record<Statut, number>;
  total: number;
  /** Total minus what the site has no object for and what the company owns. */
  applicables: number;
  /** Percentage of applicables fully respected, rounded. */
  score: number;
}

export function compter(groupes: Groupe[]): Comptes {
  const parStatut = { OK: 0, PART: 0, KO: 0, NA: 0, ORG: 0 } as Record<Statut, number>;

  for (const groupe of groupes) {
    for (const critere of groupe.criteres) parStatut[critere.statut] += 1;
  }

  const total = Object.values(parStatut).reduce((sum, n) => sum + n, 0);
  const applicables = total - parStatut.NA - parStatut.ORG;

  return { parStatut, total, applicables, score: Math.round((100 * parStatut.OK) / applicables) };
}
