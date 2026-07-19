package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.service.StorageService;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class MinioStorageServiceImpl implements StorageService {

    MinioClient minioClient;
    String minioBucket;          // injected by the @Bean minioBucket() in MinioConfig

    @Override
    public void put(String objectKey, String content, String contentType) {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectKey)
                            .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                            .contentType(contentType)
                            .build()
            );
            log.debug("Stored object {} in bucket {}", objectKey, minioBucket);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload object: " + objectKey, e);
        }
    }

    @Override
    public String get(String objectKey) {
        try (InputStream stream = getStream(objectKey)) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download object: " + objectKey, e);
        }
    }

    @Override
    public InputStream getStream(String objectKey) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to get stream for object: " + objectKey, e);
        }
    }

    @Override
    public void delete(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectKey)
                            .build()
            );
            log.debug("Deleted object {} from bucket {}", objectKey, minioBucket);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete object: " + objectKey, e);
        }
    }

    @Override
    public boolean exists(String objectKey) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioBucket)
                            .object(objectKey)
                            .build()
            );
            return true;
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) {
                return false;
            }
            throw new RuntimeException("Failed to stat object: " + objectKey, e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to stat object: " + objectKey, e);
        }
    }
}
