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
  /** URL segment, distinct from the id: the W3C reads as "w3c", not "wsg". */
  slug: string;
  /** Short name, for a heading that already has context around it. */
  court: string;
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
export const STATUTS: Record<Statut, { label: string; singulier: string; pluriel: string }> = {
  // Feminine throughout: the subject is a *règle* or a *ligne directrice*, and
  // both are feminine in French. The Markdown files already agreed.
  OK: { label: 'Respectée', singulier: 'respectée', pluriel: 'respectées' },
  PART: { label: 'Partielle', singulier: 'partielle', pluriel: 'partielles' },
  KO: { label: 'Non respectée', singulier: 'non respectée', pluriel: 'non respectées' },
  NA: { label: 'Sans objet', singulier: 'sans objet', pluriel: 'sans objet' },
  // Not "non applicable": the question does arise, the answer is simply not
  // settled yet. Kept out of the score for the same reason.
  ORG: { label: 'Critère en cours d’analyse', singulier: 'en cours', pluriel: 'en cours' },
};

/**
 * The comments are written in the same prose as the Markdown files, backticks
 * included. On a page those backticks would print as themselves, so they become
 * `<code>` here. The text is escaped first: it is ours, but a rule about not
 * trusting content is not worth an exception the day someone pastes an angle
 * bracket into a verdict.
 */
export function formaterCommentaire(texte: string): string {
  const escaped = texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** The label a count of `n` takes, so a chip never reads "1 non respectées". */
export function accorder(statut: Statut, n: number): string {
  return n > 1 ? STATUTS[statut].pluriel : STATUTS[statut].singulier;
}

/** Display order of the statuses, worst-known first after the good news. */
export const ORDRE: Statut[] = ['OK', 'PART', 'KO', 'NA', 'ORG'];

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
