import { auth } from "@/lib/auth"; // importez votre instance auth que nous avons créée plus tôt
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
