import { z } from "zod";

export const env = z
  .object({
    DATABASE_URL: z.string("Database url is not a string").trim(),
    PORT: z.number("Port is not a number").default(3000),
    RESEND_API_KEY: z.string("Resend api key is not a string"),
    GOOGLE_CLIENT_ID: z.string("Google client id is not a string"),
    GOOGLE_CLIENT_SECRET: z.string("Google client secret is not a string"),
    REDIRECT_URI: z.string("Redirect uri is not a string"),
    GITHUB_CLIENT_ID: z.string("Github client id is not a string"),
    GITHUB_CLIENT_SECRET: z.string("Github client secret is not a string"),
  })
  .safeParse(process.env);
