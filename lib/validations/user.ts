import * as z from "zod";

export const userValidation = z.object({
  profile_photo: z.string().url().min(1),
  name: z
    .string()
    .min(3, { message: "Name is required" })
    .max(30, { message: "Name should not be longer than 30 characters" }),
  username: z.string().min(3, { message: "Username is required" }),
  bio: z
    .string()
    .max(100, { message: "Bio should not be longer than 100 characters" }),
});
