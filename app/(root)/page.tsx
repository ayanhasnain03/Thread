import { UserButton } from "@clerk/nextjs";

const page = () => {
  return (
    <div className="">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
export default page;
