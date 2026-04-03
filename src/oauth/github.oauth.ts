import { GitHub } from "arctic";
import { env } from "../validators/env.validator.js";

const { data, error } = env;

if (error) {
  console.log(error);
}

export const github = new GitHub(
  data?.GITHUB_CLIENT_ID!,
  data?.GITHUB_CLIENT_SECRET!,
  data?.REDIRECT_URI!,
);
