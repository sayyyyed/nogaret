export function sortByDateDescending<T extends { data: { date?: Date; startDate?: Date } }>(entries: T[]) {
  return [...entries].sort((left, right) => {
    const leftDate = left.data.date ?? left.data.startDate;
    const rightDate = right.data.date ?? right.data.startDate;
    return Number(rightDate) - Number(leftDate);
  });
}

export function isPublished<T extends { data: { draft?: boolean } }>(entry: T) {
  return !entry.data.draft;
}
