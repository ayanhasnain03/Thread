import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  try {
    const [posts, user] = await Promise.all([fetchPosts(1, 30), currentUser()]);

    if (!posts || !posts.posts || posts.posts.length === 0) {
      return (
        <>
          <h1 className="head-text text-left">Home</h1>
          <p className="np-result">No Thread Found</p>
        </>
      );
    }

    return (
      <>
        <h1 className="head-text text-left">Home</h1>
        <section className="mt-9 flex flex-col gap-10">
          {posts.posts.map((post) => (
            <ThreadCard
              key={post._id}
              id={post._id}
              currentUserId={user?.id || ""}
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.children}
            />
          ))}
        </section>
      </>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <>
        <h1 className="head-text text-left">Home</h1>
        <p className="np-result">
          Error fetching threads. Please try again later.
        </p>
      </>
    );
  }
}
