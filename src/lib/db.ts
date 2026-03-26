import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJSON<T>(filename: string): Promise<T | null> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  
  // Ensure directory exists
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// User database functions
import type { User } from "@/types";

export async function getUsers(): Promise<User[]> {
  const users = await readJSON<User[]>("users.json");
  return users || [];
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeJSON("users.json", users);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.id === id) || null;
}

export async function createUser(user: User): Promise<User> {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

