export function collectionPath(collection: string, id: string) {
  return `/${collection}/${id.replace(/\/index$/, '').replace(/\\/g, '/')}/`;
}
