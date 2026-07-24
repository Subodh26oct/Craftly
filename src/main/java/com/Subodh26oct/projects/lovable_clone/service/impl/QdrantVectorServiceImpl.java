package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.rag.CodeChunk;
import com.Subodh26oct.projects.lovable_clone.service.CodeVectorService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QdrantVectorServiceImpl implements CodeVectorService {

    @Value("${qdrant.url}")
    String qdrantUrl;

    @Value("${qdrant.api-key:}")
    String qdrantApiKey;

    @Value("${qdrant.collection}")
    String collectionName;

    final ObjectMapper objectMapper;

    final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .build();

    static final int VECTOR_DIM = 128;

    private Request.Builder buildRequestBuilder(String url) {
        Request.Builder builder = new Request.Builder().url(url);
        if (qdrantApiKey != null && !qdrantApiKey.trim().isEmpty()) {
            builder.addHeader("api-key", qdrantApiKey.trim());
        }
        return builder;
    }

    @Override
    public void indexFile(Long projectId, String path, String content) {
        if (content == null || content.trim().isEmpty()) {
            return;
        }

        try {
            ensureCollectionExists();
            removeFileIndex(projectId, path);

            List<ChunkData> chunks = splitCodeIntoChunks(path, content);
            if (chunks.isEmpty()) return;

            List<Map<String, Object>> points = new ArrayList<>();
            for (ChunkData chunk : chunks) {
                float[] vector = computeEmbeddingVector(chunk.text, VECTOR_DIM);
                long pointId = generatePointId(projectId, path, chunk.startLine);

                Map<String, Object> payload = new HashMap<>();
                payload.put("projectId", projectId);
                payload.put("path", path);
                payload.put("snippet", chunk.text);
                payload.put("startLine", chunk.startLine);
                payload.put("endLine", chunk.endLine);

                Map<String, Object> point = new HashMap<>();
                point.put("id", pointId);
                point.put("vector", vector);
                point.put("payload", payload);

                points.add(point);
            }

            Map<String, Object> reqBody = Map.of("points", points);
            String json = objectMapper.writeValueAsString(reqBody);

            Request request = buildRequestBuilder(qdrantUrl + "/collections/" + collectionName + "/points?wait=true")
                    .put(RequestBody.create(json, MediaType.get("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("Indexed {} vector chunks in Qdrant for project {} file {}", points.size(), projectId, path);
                } else {
                    log.warn("Qdrant index response failed with code {}: {}", response.code(), response.message());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to index file in Qdrant Vector DB ({}: {}). Code indexing skipped gracefully.", e.getClass().getSimpleName(), e.getMessage());
        }
    }

    @Override
    public void removeFileIndex(Long projectId, String path) {
        try {
            Map<String, Object> filter = Map.of(
                    "filter", Map.of(
                            "must", List.of(
                                    Map.of("key", "projectId", "match", Map.of("value", projectId)),
                                    Map.of("key", "path", "match", Map.of("value", path))
                            )
                    )
            );

            String json = objectMapper.writeValueAsString(filter);
            Request request = buildRequestBuilder(qdrantUrl + "/collections/" + collectionName + "/points/delete")
                    .post(RequestBody.create(json, MediaType.get("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.debug("Removed Qdrant vector index points for file {}", path);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to remove points from Qdrant: {}", e.getMessage());
        }
    }

    @Override
    public List<CodeChunk> searchRelevantChunks(Long projectId, String prompt, int topK) {
        List<CodeChunk> results = new ArrayList<>();
        try {
            float[] queryVector = computeEmbeddingVector(prompt, VECTOR_DIM);

            Map<String, Object> searchReq = Map.of(
                    "vector", queryVector,
                    "limit", topK,
                    "with_payload", true,
                    "filter", Map.of(
                            "must", List.of(
                                    Map.of("key", "projectId", "match", Map.of("value", projectId))
                            )
                    )
            );

            String json = objectMapper.writeValueAsString(searchReq);
            Request request = buildRequestBuilder(qdrantUrl + "/collections/" + collectionName + "/points/search")
                    .post(RequestBody.create(json, MediaType.get("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonNode root = objectMapper.readTree(response.body().string());
                    JsonNode hits = root.path("result");

                    for (JsonNode hit : hits) {
                        double score = hit.path("score").asDouble();
                        JsonNode payload = hit.path("payload");
                        String path = payload.path("path").asText();
                        String snippet = payload.path("snippet").asText();
                        int startLine = payload.path("startLine").asInt(1);
                        int endLine = payload.path("endLine").asInt(1);

                        results.add(new CodeChunk(projectId, path, snippet, startLine, endLine, score));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Qdrant vector search failed ({}: {}). Returning empty RAG context.", e.getClass().getSimpleName(), e.getMessage());
        }

        return results;
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private synchronized void ensureCollectionExists() {
        try {
            Request checkReq = buildRequestBuilder(qdrantUrl + "/collections/" + collectionName)
                    .get()
                    .build();

            try (Response checkResp = httpClient.newCall(checkReq).execute()) {
                if (checkResp.isSuccessful()) {
                    return; // Collection already exists
                }
            }

            // Create collection
            Map<String, Object> createReq = Map.of(
                    "vectors", Map.of(
                            "size", VECTOR_DIM,
                            "distance", "Cosine"
                    )
            );

            String json = objectMapper.writeValueAsString(createReq);
            Request createRequest = buildRequestBuilder(qdrantUrl + "/collections/" + collectionName)
                    .put(RequestBody.create(json, MediaType.get("application/json")))
                    .build();

            try (Response createResp = httpClient.newCall(createRequest).execute()) {
                if (createResp.isSuccessful()) {
                    log.info("Created Qdrant Vector Collection: {}", collectionName);
                }
            }
        } catch (Exception e) {
            log.warn("Could not verify/create Qdrant collection: {}", e.getMessage());
        }
    }

    private static float[] computeEmbeddingVector(String text, int dim) {
        float[] vector = new float[dim];
        if (text == null || text.trim().isEmpty()) return vector;

        String[] tokens = text.toLowerCase().split("\\W+");
        for (String token : tokens) {
            if (token.isEmpty()) continue;
            int hash = Math.abs(token.hashCode());
            int index = hash % dim;
            vector[index] += 1.0f;
        }

        // Normalize vector (Euclidean L2 norm)
        float sumSquares = 0.0f;
        for (float v : vector) {
            sumSquares += v * v;
        }
        if (sumSquares > 0) {
            float norm = (float) Math.sqrt(sumSquares);
            for (int i = 0; i < dim; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
    }

    private static List<ChunkData> splitCodeIntoChunks(String path, String content) {
        List<ChunkData> chunks = new ArrayList<>();
        String[] lines = content.split("\r?\n");
        int chunkSize = 25; // 25 lines per chunk
        int overlap = 5;

        for (int i = 0; i < lines.length; i += (chunkSize - overlap)) {
            int end = Math.min(i + chunkSize, lines.length);
            StringBuilder sb = new StringBuilder();
            for (int j = i; j < end; j++) {
                sb.append(lines[j]).append("\n");
            }
            chunks.add(new ChunkData(sb.toString().trim(), i + 1, end));
            if (end == lines.length) break;
        }

        return chunks;
    }

    private static long generatePointId(Long projectId, String path, int startLine) {
        try {
            String rawKey = projectId + ":" + path + ":" + startLine;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            long id = 0;
            for (int i = 0; i < 8; i++) {
                id = (id << 8) | (hash[i] & 0xFF);
            }
            return Math.abs(id);
        } catch (Exception e) {
            return Math.abs((projectId + ":" + path + ":" + startLine).hashCode());
        }
    }

    private record ChunkData(String text, int startLine, int endLine) {}
}
