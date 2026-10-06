-- Enforce upload constraints at the storage layer for the images bucket.
-- The upload-url API validates client-reported metadata; these bucket settings
-- are the server-side backstop for the actual uploaded bytes.
UPDATE storage.buckets
SET
  file_size_limit = 104857600, -- 100MB（视频上限；图片另由 API 限 10MB）
  allowed_mime_types = ARRAY[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/zip',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'images';
