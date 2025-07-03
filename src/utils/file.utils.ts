import { readFile, writeFile } from "fs/promises"

export async function readJSONFile<T>(filePath: string): Promise<T> {
  const data = await readFile(filePath, "utf-8")
  return JSON.parse(data) as T
}

export async function writeJSONFile<T>(
  filePath: string,
  content: T
): Promise<void> {
  await writeFile(filePath, JSON.stringify(content, null, 2), "utf-8")
}
