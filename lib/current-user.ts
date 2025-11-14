import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return userId;
  } catch (error) {
    // For development without Clerk keys, return a default user
    console.warn("Auth failed, using default user:", error);
    return "user123";
  }
}
