import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (typeof userId === "string") {
    return userId;
  }

  return "Default_user";
}
