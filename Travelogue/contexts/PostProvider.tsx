import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data
interface PostContextType {
  selectedPost: any; 
  setSelectedPost: (post: any) => void;
}

// Create the context
const PostContext = createContext<PostContextType | undefined>(undefined);

// Provider component
export const PostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <PostContext.Provider value={{ selectedPost, setSelectedPost }}>
      {children}
    </PostContext.Provider>
  );
};

// Custom hook to use the post context
export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
