import { useUser } from "@clerk/clerk-react";

interface AuthObject {
  userId?: string;
}

export const checkAuth = () => {
  const { isSignedIn, user } = useUser();
  return { isSignedIn, user };
};

export const protectPage = (auth: AuthObject) => {
  if (!auth.userId) {
    throw new Error("Unauthorized");
  }
};
