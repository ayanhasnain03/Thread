"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  await connectToDB();

  try {
    // Ensure username is stored in lowercase (if that's your requirement)
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true, // Creates a new document if no document matches the query
        new: true, // Returns the updated document
      }
    );

    if (!updatedUser) {
      throw new Error("User not found or could not be updated");
    }

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.error(`Error updating user: ${error.message}`);
    throw new Error(`Error updating user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    const user = await User.findOne({ id: userId });
    return user;
  } catch (error: any) {
    console.error(`Error fetching user: ${error.message}`);
    throw new Error(`Error fetching user: ${error.message}`);
  }
}
