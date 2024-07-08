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
  connectToDB(); // Establishes a connection to the database

  const skipAmount = (pageNumber - 1) * pageSize; // Calculates how many documents to skip based on the current page number and page size

  // Query to fetch posts that have no parent (top-level threads)
  const postsQuery = Thread.find({
    parentId: { $in: [null, undefined] }, // Filters threads where parentId is either null or undefined
  })
    .sort({ createdAt: "desc" }) // Sorts the results by createdAt field in descending order (latest first)
    .skip(skipAmount) // Skips documents based on the calculated skipAmount
    .limit(pageSize) // Limits the number of documents returned to the pageSize

    // Populates the 'author' field, referencing the 'User' model
    .populate({
      path: "author",
      model: "User",
    })

    // Populates the 'children' field of each document, if any
    .populate({
      path: "children",
      populate: {
        path: "author", // Populates the 'author' field of children
        model: "User", // References the 'User' model
        select: "_id name parentId image", // Selects specific fields from the 'User' model
      },
    });

  // Counts total number of posts that meet the criteria
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] }, // Same filter as above
  });

  // Executes the postsQuery and waits for the result
  const posts = await postsQuery.exec();

  // Determines if there are more posts beyond the current page
  const isNext = totalPostsCount > skipAmount + posts.length;

  // Returns the fetched posts and a boolean indicating if there are more posts
  return { posts, isNext };
}
export async function fetchThreadById(id: string) {
  // This function fetches a thread by its ID, along with the authors of the thread and its nested children.
  await connectToDB();
  // Ensures that the database connection is established before proceeding with the query.

  try {
    return await Thread.findById(id)
      // Finds a thread document by its ID.
      .populate({
        path: "author",
        model: "User",
        select: "_id name parentId image",
      })
      // Populates the `author` field of the thread. The `author` field references the `User` model.
      // Only the `_id`, `name`, `parentId`, and `image` fields of the `User` model are selected.

      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id name parentId image",
          },
          // Populates the `author` field of each child thread. The `author` field references the `User` model.
          // Only the `_id`, `name`, `parentId`, and `image` fields of the `User` model are selected.

          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: "User",
              select: "_id name parentId image",
            },
          },
          // Populates the `children` field of each child thread. The `children` field references other `Thread` documents.
          // Further populates the `author` field of these nested children, referencing the `User` model.
          // Only the `_id`, `name`, `parentId`, and `image` fields of the `User` model are selected.
        ],
      })
      .exec();
    // Executes the query and returns the populated thread document.
  } catch (error: any) {
    console.log(`Error fetching thread: ${error.message}`);
    // Logs an error message if something goes wrong during the query execution.
  }
}
