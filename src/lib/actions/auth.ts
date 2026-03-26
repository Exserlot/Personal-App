"use server";

import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { findUserByUsername, findUserByEmail, createUser } from "@/lib/db";
import type { User } from "@/types";
import { AuthError } from "next-auth";

export async function signInWithCredentials(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid username or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function signUpWithCredentials(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!username || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Check if username already exists
  const existingUserByUsername = await findUserByUsername(username);
  if (existingUserByUsername) {
    return { error: "Username already taken" };
  }

  // Check if email already exists
  const existingUserByEmail = await findUserByEmail(email);
  if (existingUserByEmail) {
    return { error: "Email already registered" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    provider: "credentials",
    createdAt: new Date().toISOString(),
  };

  try {
    await createUser(newUser);
    
    // Auto sign in after registration
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Failed to create account" };
  }
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}
