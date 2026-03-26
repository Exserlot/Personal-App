"use server";

import fs from "fs/promises";
import path from "path";
import { Task, Habit } from "@/types";
import { revalidatePath } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const HABITS_FILE = path.join(DATA_DIR, "habits.json");

// --- Helpers ---
async function ensureFile(filePath: string, defaultData: any) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultData), "utf-8");
  }
}

async function readTasks(): Promise<Task[]> {
  await ensureFile(TASKS_FILE, []);
  const data = await fs.readFile(TASKS_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeTasks(data: Task[]) {
  await ensureFile(TASKS_FILE, []);
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function readHabits(): Promise<Habit[]> {
  await ensureFile(HABITS_FILE, []);
  const data = await fs.readFile(HABITS_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeHabits(data: Habit[]) {
  await ensureFile(HABITS_FILE, []);
  await fs.writeFile(HABITS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// --- Tasks ---
export async function getTasks(date: string): Promise<Task[]> {
  const tasks = await readTasks();
  return tasks.filter(t => t.date === date);
}

export async function addTask(title: string, date: string, priority: "low"|"medium"|"high" = "medium") {
  const tasks = await readTasks();
  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    date,
    completed: false,
    priority,
    userId: "user-1"
  };
  tasks.push(newTask);
  await writeTasks(tasks);
  revalidatePath("/productivity");
  return { success: true };
}

export async function toggleTask(id: string) {
  const tasks = await readTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    await writeTasks(tasks);
    revalidatePath("/productivity");
  }
}

export async function deleteTask(id: string) {
  const tasks = await readTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await writeTasks(filtered);
  revalidatePath("/productivity");
}

export async function migrateIncompleteTasks(currentDate: string) {
    const tasks = await readTasks();
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    let changed = false;
    tasks.forEach(t => {
        if (t.date === currentDate && !t.completed) {
            t.date = nextDateStr;
            changed = true;
        }
    });

    if (changed) {
        await writeTasks(tasks);
        revalidatePath("/productivity");
    }
}

// --- Habits ---
export async function getHabits(): Promise<Habit[]> {
  return await readHabits();
}

export async function addHabit(name: string) {
  const habits = await readHabits();
  const newHabit: Habit = {
    id: crypto.randomUUID(),
    name,
    streak: 0,
    completedDates: [],
    userId: "user-1"
  };
  habits.push(newHabit);
  await writeHabits(habits);
  revalidatePath("/productivity");
  return { success: true };
}

export async function toggleHabit(id: string, date: string) {
  const habits = await readHabits();
  const habit = habits.find(h => h.id === id);
  if (habit) {
    const index = habit.completedDates.indexOf(date);
    if (index > -1) {
      habit.completedDates.splice(index, 1);
      // Recalculate streak logic could go here
    } else {
      habit.completedDates.push(date);
      // Recalculate streak logic
    }
    await writeHabits(habits);
    revalidatePath("/productivity");
  }
}

export async function deleteHabit(id: string) {
  const habits = await readHabits();
  const filtered = habits.filter(h => h.id !== id);
  await writeHabits(filtered);
  revalidatePath("/productivity");
}
