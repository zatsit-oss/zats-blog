import React from 'react';
import { PathUrlProvider } from '../context/PathUrlContext';  

function Root(props) {
  return (
    <PathUrlProvider>
      {props.children}
    </PathUrlProvider>
  );
}

export default Root;