import { Google } from "arctic";
import { env } from "../validators/env.validator";

const { data, error } = env;

if (error) {
  console.log(error);
}

export const google = new Google(
  data?.GOOGLE_CLIENT_ID!,
  data?.GOOGLE_CLIENT_SECRET!,
  data?.REDIRECT_URI!,
);
