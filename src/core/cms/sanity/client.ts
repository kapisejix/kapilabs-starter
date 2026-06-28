import { createClient } from "@sanity/client";
import { SANITY_API_VERSION } from "./version";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || SANITY_API_VERSION,
  token: import.meta.env.SANITY_TOKEN,
  useCdn: true,
});