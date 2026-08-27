import { cache } from "react";
import {
    getAllBlogPosts as _getAllBlogPosts,
    getBlogPostBySlug as _getBlogPostBySlug,
    createBlogPost as _createBlogPost,
    updateBlogPost as _updateBlogPost,
    deleteBlogPost as _deleteBlogPost,
} from "./supabase";

// Cached for Server Components / SSG
export const getAllBlogPosts = cache(_getAllBlogPosts);
export const getBlogPostBySlug = cache(_getBlogPostBySlug);

// Mutations are not cached
export { _createBlogPost as createBlogPost, _updateBlogPost as updateBlogPost, _deleteBlogPost as deleteBlogPost };
