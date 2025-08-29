import { createAuthClient } from "better-auth/client";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [phoneNumberClient()],
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;