import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ['className']],
    img: [...(defaultSchema.attributes?.img || []), 'src', 'alt', 'title', 'width', 'height', 'loading'],
    h1: [...(defaultSchema.attributes?.h1 || []), 'id'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
    h4: [...(defaultSchema.attributes?.h4 || []), 'id'],
    a: [...(defaultSchema.attributes?.a || []), 'href', 'title', 'target', 'rel']
  }
};

export default function SanitizedMarkdown({ content = '' }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, sanitizeSchema],
        rehypeSlug,
        rehypeHighlight
      ]}
    >
      {content || ''}
    </ReactMarkdown>
  );
}

export { SanitizedMarkdown };
