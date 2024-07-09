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
    const updatedUser = await User.findOneAndUpdate(
      { id: userId }, // Assuming 'id' is the correct identifier for User model
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true, // Assuming this field exists in User model
      },
      {
        upsert: true, // Create new document if not found
        new: true, // Return updated document
      }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.error(`Error updating user: ${error.message}`);
    throw new Error("Failed to update user");
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    return await User.findOne({ id: userId });
    // .populate({
    //   path: "communities",
    //   model: "Community",
    //   select: "name",
    // });
  } catch (error: any) {
    console.error(`Error fetching user: ${error.message}`);
    throw new Error("Failed to fetch user");
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
