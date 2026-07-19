package com.Subodh26oct.projects.lovable_clone.service;

import java.io.InputStream;

/**
 * Abstraction over object storage (MinIO/S3).
 * All file operations use "object keys" which are the logical paths
 * within the storage bucket, e.g. "projects/42/src/App.tsx".
 */
public interface StorageService {

    /**
     * Upload (create or overwrite) a file in the bucket.
     *
     * @param objectKey   the storage key / path within the bucket
     * @param content     UTF-8 text content
     * @param contentType MIME type, e.g. "text/plain"
     */
    void put(String objectKey, String content, String contentType);

    /**
     * Download a file from the bucket as a UTF-8 string.
     *
     * @param objectKey the storage key / path within the bucket
     * @return file contents as a string
     */
    String get(String objectKey);

    /**
     * Download a file from the bucket as a raw InputStream (for ZIP streaming).
     *
     * @param objectKey the storage key / path within the bucket
     * @return file content stream
     */
    InputStream getStream(String objectKey);

    /**
     * Delete a file from the bucket.
     *
     * @param objectKey the storage key / path within the bucket
     */
    void delete(String objectKey);

    /**
     * Check whether an object exists in the bucket.
     *
     * @param objectKey the storage key / path within the bucket
     * @return true if the object exists
     */
    boolean exists(String objectKey);
}
