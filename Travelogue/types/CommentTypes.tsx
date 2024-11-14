export interface BaseComment {
    id: string;
    author: Author;
    content: string;
    created_at: string;
    status_id: number;
    reports: number;
    parentId: string | null;
  }
  
  // RatingObjectSpecifics contains fields specific to RatingObject
  export interface RatingObjectSpecifics {
    rating: number;
    image: string;
  }
   
  export interface Author {
    id: string;
    avatar: any;
    username: string;
  }
  
  // Extend BaseComment for RatingObject by adding RatingObjectSpecifics fields
  export type RatingComment= BaseComment & RatingObjectSpecifics;
  
  // Comment uses only BaseComment fields without any additional fields
  export type Comment = BaseComment;
  
  // Union type for flexibility in handling both RatingObject and Comment
  export type CommentType = RatingComment | Comment;