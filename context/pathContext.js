// src/context/PathUrlContext.js
import React, { createContext, useContext } from 'react';

const PATH_URL = {
  website: "https://blog.zatsit.fr",
  blog: "/blog",
  socialShare: {
    x: "https://x.com/intent/post?url=",
    linkedin: "https://www.linkedin.com/shareArticle/?mini=true&url="
  }
};

// Create the context
const PathUrlContext = createContext(PATH_URL);

// Custom hook to use the context
export const usePathUrlContext = () => useContext(PathUrlContext);

// Provider component (optional if you plan to add dynamic state in the future)
export const PathUrlProvider = ({ children }) => {
  return (
    <PathUrlContext.Provider value={PATH_URL}>
      {children}
    </PathUrlContext.Provider>
  );
};
