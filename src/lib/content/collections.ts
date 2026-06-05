import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

const contentFiles = import.meta.glob('../../content/**/*.{md,mdx}');

export function hasCollectionContent(collection: CollectionKey) {
  return Object.keys(contentFiles).some((path) => path.includes(`/content/${collection}/`));
}

export async function getCollectionIfNotEmpty<C extends CollectionKey>(
  collection: C,
  filter?: (entry: CollectionEntry<C>) => boolean,
) {
  if (!hasCollectionContent(collection)) {
    return [] as CollectionEntry<C>[];
  }

  return getCollection(collection, filter);
}
