import type { CollectionEntry } from 'astro:content';

type NoteEntry = CollectionEntry<'notes'>;
export type NoteType = 'permanent' | 'concept' | 'research' | 'reference' | 'moc' | 'topic-hub';

export const noteFolderToType: Record<string, NoteType> = {
  concepts: 'concept',
  mocs: 'moc',
  permanent: 'permanent',
  references: 'reference',
  research: 'research',
  'topic-hubs': 'topic-hub',
};

const NOTE_TYPE_ORDER: NoteType[] = ['moc', 'permanent', 'concept', 'reference', 'research', 'topic-hub'];

export function noteTypeOrder(type: NoteType) {
  const index = NOTE_TYPE_ORDER.indexOf(type);
  return index === -1 ? NOTE_TYPE_ORDER.length : index;
}

export function noteTypeLabel(type: NoteType) {
  const labels: Record<NoteType, string> = {
    permanent: 'Permanent',
    concept: 'Concept',
    research: 'Research',
    reference: 'Reference',
    moc: 'Map of Content',
    'topic-hub': 'Topic Hub',
  };
  return labels[type];
}

export function inferNoteType(id: string): NoteType {
  const folder = id.split('/')[0];
  return noteFolderToType[folder] ?? 'permanent';
}

export function titleFromId(id: string): string {
  const basename = id.split('/').pop() ?? id;
  const slug = basename.replace(/\.(md|mdx)$/i, '');
  const words = slug
    .split(/[-_\s]+/)
    .map((word) => {
      if (!word) return '';
      if (word === word.toUpperCase() && word.length > 1) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .filter(Boolean);
  return words.join(' ') || basename;
}

export function noteTitle(entry: NoteEntry): string {
  return entry.data.title ?? titleFromId(entry.id);
}

export function noteDescription(entry: NoteEntry): string {
  return entry.data.description ?? '';
}

export function noteType(entry: NoteEntry): NoteType {
  return entry.data.noteType ?? inferNoteType(entry.id);
}

async function fileMtime(filePath: string | undefined): Promise<Date | undefined> {
  if (!filePath) {
    return undefined;
  }
  const mtimes = import.meta.env.NOTE_MTIMES as Record<string, string> | undefined;
  const iso = mtimes?.[filePath];
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function noteDate(entry: NoteEntry): Promise<Date> {
  if (entry.data.date) {
    return entry.data.date;
  }
  return (await fileMtime(entry.filePath)) ?? new Date(0);
}

export function sortNotesByDateDescending(entries: NoteEntry[], dates: Map<string, Date>) {
  return [...entries].sort((left, right) => Number(dates.get(right.id) ?? 0) - Number(dates.get(left.id) ?? 0));
}

export function findBacklinks(entries: NoteEntry[], id: string): NoteEntry[] {
  const target = id.replace(/\/$/, '');
  return entries.filter((entry) => {
    const connections = entry.data.connections ?? [];
    const aliases = entry.data.aliases ?? [];
    const links = [...connections, ...aliases].map((link) => link.replace(/^\//, '').replace(/\/$/, ''));
    return links.includes(target);
  });
}