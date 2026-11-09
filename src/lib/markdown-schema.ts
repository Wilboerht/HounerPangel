import { defaultSchema } from "rehype-sanitize";

export const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "iframe", "svg", "path", "mark"],
    attributes: {
        ...defaultSchema.attributes,
        "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
        iframe: ["src", "title", "allow", "allowFullScreen", "loading", "referrerPolicy", "className"],
        svg: ["viewBox", "width", "height", "ariaHidden", "className"],
        path: ["d", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin"],
    },
};
