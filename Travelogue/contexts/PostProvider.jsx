import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data


// Create the context
const PostContext = createContext(undefined);

// Provider component
export const PostProvider = ({ children }) => {
  const [selectedPost, setSelectedPost] = useState(undefined);

  return (
    <PostContext.Provider value={{ selectedPost, setSelectedPost }}>
      {children}
    </PostContext.Provider>
  );
};

// Custom hook to use the post context
export const usePost = () => useContext(PostContext);
