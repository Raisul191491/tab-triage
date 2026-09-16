/** Saved tab groups the user chose to keep instead of closing outright. */

export interface ReadingListEntry {
  url: string
  title: string
}

export interface ReadingList {
  id: string
  name: string
  createdAt: number
  entries: ReadingListEntry[]
}

const STORAGE_KEY = 'tt:reading-lists'

async function readAll(): Promise<ReadingList[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY)
  return (stored[STORAGE_KEY] as ReadingList[]) ?? []
}

async function writeAll(lists: ReadingList[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: lists })
}

export async function getReadingLists(): Promise<ReadingList[]> {
  return readAll()
}

export async function saveReadingList(
  name: string,
  entries: ReadingListEntry[],
): Promise<ReadingList> {
  const lists = await readAll()
  const list: ReadingList = {
    id: `list:${Date.now()}`,
    name,
    createdAt: Date.now(),
    entries,
  }
  lists.unshift(list)
  await writeAll(lists)
  return list
}

export async function deleteReadingList(id: string): Promise<void> {
  const lists = await readAll()
  await writeAll(lists.filter((l) => l.id !== id))
}
