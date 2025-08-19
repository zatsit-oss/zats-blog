import { useLocation } from "@docusaurus/router";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

import BlogPostItem from "@theme-original/BlogPostItem";
import React from "react";
import SocialsComponent from "../../components/SocialsComponent";

export default function BlogPostItemWrapper(props) {
  const location = useLocation();
  const { isBlogPostPage } = useBlogPost();

  return (
    <>
      <BlogPostItem {...props} />
      {isBlogPostPage ? (
        <SocialsComponent articleUrl={location.pathname} />
      ) : null}
    </>
  );
}
