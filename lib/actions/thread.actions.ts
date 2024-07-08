"use server";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  await connectToDB();

  try {
    // Create the thread
    const createdThread = await Thread.create({
      text,
      author,
      communityId,
      path,
    });

    // Update the user model to link the created thread
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // Revalidate the path
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}
