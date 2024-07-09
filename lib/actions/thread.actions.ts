"use server";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import path from "path";

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

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: "User",
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    console.error(`Error fetching posts: ${error.message}`);
    throw new Error("Failed to fetch posts");
  }
}

export async function fetchThreadById(id: string) {
  await connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: "User",
        select: "_id name parentId image",
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      })
      .populate({
        path: "children",
        populate: {
          path: "children",
          model: "Thread",
          populate: {
            path: "author",
            model: "User",
            select: "_id name parentId image",
          },
        },
      })
      .exec();

    return thread;
  } catch (error: any) {
    console.error(`Error fetching thread: ${error.message}`);
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await connectToDB();

  try {
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    console.error(`Error adding comment: ${error.message}`);
    throw new Error(`Error adding comment: ${error.message}`);
  }
}
