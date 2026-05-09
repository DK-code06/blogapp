export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followers: User[] | string[];
  following: User[] | string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: User;
  likes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  likes: string[];
  parentComment?: string;
  replies: Comment[];
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}
