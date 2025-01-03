import { useLocation } from "@docusaurus/router";

import BlogPostItem from "@theme-original/BlogPostItem";
import React from "react";
import SocialsComponent from "../../components/SocialsComponent";


export default function BlogPostItemWrapper(props) {
  const location = useLocation();

  return (
    <>
      <BlogPostItem {...props} />
      <SocialsComponent articleUrl={location.pathname}/>
    </>
  );
}