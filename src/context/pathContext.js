import React, { createContext, useContext } from "react";

const PATH_URL = {
  website: "https://blog.zatsit.fr",
  blog: "/blog",
  socialShare: {
    x: "https://x.com/intent/post?url=",
    linkedin: "https://www.linkedin.com/shareArticle/?mini=true&url=",
  },
};

const PathUrlContext = createContext(PATH_URL);

export const usePathUrlContext = () => useContext(PathUrlContext);

export const PathUrlProvider = ({ children }) => {
  return (
    <PathUrlContext.Provider value={PATH_URL}>
      {children}
    </PathUrlContext.Provider>
  );
};