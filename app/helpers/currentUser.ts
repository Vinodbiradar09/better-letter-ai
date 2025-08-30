import { authOptions } from "../api/auth/options";
import { getServerSession } from "next-auth";

export async function currentUser() {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
}