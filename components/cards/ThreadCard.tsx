import Image from "next/image";
import Link from "next/link";

interface Props {
  id: string;
  currentUserId: string | null;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {
  return (
    <article className="flex w-full flex-col rounded-xl bg-dark-2 p-7 mt-4">
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`}>
              <a className="relative h-11 w-11">
                <Image
                  src={author.image}
                  alt="user_community_image"
                  width={44}
                  height={44}
                  className="cursor-pointer rounded-full"
                />
              </a>
            </Link>
            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`}>
              <a className="w-fit">
                <h4 className="cursor-pointer text-base-semibold text-light-1">
                  {author.name}
                </h4>
              </a>
            </Link>
            <p className="text-small-regular text-light-2">{content}</p>

            <div className="mt-5 flex gap-3">
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex gap-3.5">
                <Link href={`/thread/${id}`}>
                  <a>
                    <Image
                      src="/assets/reply.svg"
                      alt="reply"
                      width={24}
                      height={24}
                      className="cursor-pointer"
                    />
                  </a>
                </Link>
              </div>
              <div className="flex gap-3.5">
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex gap-3.5">
                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <a className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} replies
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
