import { cache } from "react";
import {
    getAllBlogPosts as _getAllBlogPosts,
    getBlogPostBySlug as _getBlogPostBySlug,
    getAllBlogSlugs as _getAllBlogSlugs,
    getAdjacentPosts as _getAdjacentPosts,
    createBlogPost as _createBlogPost,
    updateBlogPost as _updateBlogPost,
    deleteBlogPost as _deleteBlogPost,
} from "./supabase";

// Cached for Server Components / SSG
export const getAllBlogPosts = cache(_getAllBlogPosts);
export const getBlogPostBySlug = cache(_getBlogPostBySlug);
export const getAllBlogSlugs = cache(_getAllBlogSlugs);
export const getAdjacentPosts = cache(_getAdjacentPosts);

// Mutations are not cached
export { _createBlogPost as createBlogPost, _updateBlogPost as updateBlogPost, _deleteBlogPost as deleteBlogPost };
