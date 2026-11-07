import type { MetadataRoute } from "next";

/** Staff-only app — do not index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
