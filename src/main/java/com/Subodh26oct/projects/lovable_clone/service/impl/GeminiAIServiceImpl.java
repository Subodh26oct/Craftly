package com.Subodh26oct.projects.lovable_clone.service.impl;

import com.Subodh26oct.projects.lovable_clone.dto.chat.AIResponse;
import com.Subodh26oct.projects.lovable_clone.dto.chat.ChatMessageResponse;
import com.Subodh26oct.projects.lovable_clone.entity.ChatSession;
import com.Subodh26oct.projects.lovable_clone.entity.ProjectFile;
import com.Subodh26oct.projects.lovable_clone.repository.ProjectFileRepository;
import com.Subodh26oct.projects.lovable_clone.service.AIService;
import com.Subodh26oct.projects.lovable_clone.service.StorageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GeminiAIServiceImpl implements AIService {

    @Value("${gemini.api-key:}")
    String apiKey;

    final ProjectFileRepository projectFileRepository;
    final StorageService storageService;
    final ObjectMapper objectMapper;

    final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    @Override
    public AIResponse generateCode(ChatSession session, String prompt, List<ChatMessageResponse> history) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("placeholder")) {
            log.info("No Gemini API key configured. Using offline mock generation service.");
            return generateMockResponse(prompt);
        }

        try {
            return callGeminiAPI(session.getProject().getId(), prompt, history);
        } catch (Exception e) {
            log.error("Failed to generate code from Gemini. Falling back to mock generator.", e);
            return generateMockResponse(prompt);
        }
    }

    @Override
    public AIResponse streamCode(ChatSession session, String prompt, List<ChatMessageResponse> history, Consumer<String> tokenConsumer) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("placeholder")) {
            log.info("No Gemini API key configured. Using offline mock streaming generation service.");
            return generateMockStreamingResponse(prompt, tokenConsumer);
        }

        try {
            return callGeminiStreamingAPI(session.getProject().getId(), prompt, history, tokenConsumer);
        } catch (Exception e) {
            log.error("Failed to stream code from Gemini. Falling back to mock streaming generator.", e);
            return generateMockStreamingResponse(prompt, tokenConsumer);
        }
    }


    private AIResponse callGeminiAPI(Long projectId, String prompt, List<ChatMessageResponse> history) throws IOException {
        String systemInstruction = """
                You are a senior frontend software engineer building modern React/CSS/HTML code for the user.
                Always respond in the exact JSON format specified by the response schema.
                Do not include markdown or backticks in the raw JSON HTTP response itself.
                
                The JSON response MUST match this structure:
                {
                  "explanation": "A concise user-facing description of what you did.",
                  "fileOperations": [
                    {
                      "type": "CREATE_OR_UPDATE",
                      "path": "src/components/Button.jsx",
                      "content": "raw file content text"
                    }
                  ]
                }
                """;

        // Build workspace context (current files)
        StringBuilder workspaceContext = new StringBuilder();
        workspaceContext.append("Current Project Files:\n");
        List<ProjectFile> dbFiles = projectFileRepository.findByProjectId(projectId);
        for (ProjectFile file : dbFiles) {
            workspaceContext.append("--- File: ").append(file.getPath()).append(" ---\n");
            try {
                String content = storageService.get(file.getMinioObjectKey());
                workspaceContext.append(content).append("\n");
            } catch (Exception e) {
                workspaceContext.append("[Error loading file content]\n");
            }
        }

        // Build prompt body
        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append("SYSTEM INSTRUCTION:\n").append(systemInstruction).append("\n\n");
        fullPrompt.append("WORKSPACE FILES:\n").append(workspaceContext).append("\n\n");
        fullPrompt.append("CHAT HISTORY:\n");
        for (ChatMessageResponse message : history) {
            fullPrompt.append("- ").append(message.role()).append(": ").append(message.content()).append("\n");
        }
        fullPrompt.append("\nLATEST USER PROMPT: ").append(prompt);

        // Build Gemini API Request Body
        Map<String, Object> requestMap = new HashMap<>();
        
        List<Map<String, Object>> contentsList = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> partsList = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", fullPrompt.toString());
        partsList.add(partMap);
        contentMap.put("parts", partsList);
        contentsList.add(contentMap);
        
        requestMap.put("contents", contentsList);

        // Generation Config with JSON Schema output schema
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");

        // Response schema specification
        Map<String, Object> responseSchema = new HashMap<>();
        responseSchema.put("type", "OBJECT");
        
        Map<String, Object> properties = new HashMap<>();
        
        Map<String, Object> expSchema = new HashMap<>();
        expSchema.put("type", "STRING");
        properties.put("explanation", expSchema);

        Map<String, Object> fileOpsSchema = new HashMap<>();
        fileOpsSchema.put("type", "ARRAY");
        
        Map<String, Object> itemSchema = new HashMap<>();
        itemSchema.put("type", "OBJECT");
        
        Map<String, Object> itemProps = new HashMap<>();
        Map<String, Object> typeSchema = new HashMap<>();
        typeSchema.put("type", "STRING");
        typeSchema.put("enum", List.of("CREATE_OR_UPDATE", "DELETE"));
        itemProps.put("type", typeSchema);
        
        Map<String, Object> pathSchema = new HashMap<>();
        pathSchema.put("type", "STRING");
        itemProps.put("path", pathSchema);
        
        Map<String, Object> contentSchema = new HashMap<>();
        contentSchema.put("type", "STRING");
        itemProps.put("content", contentSchema);

        itemSchema.put("properties", itemProps);
        itemSchema.put("required", List.of("type", "path", "content"));
        
        fileOpsSchema.put("items", itemSchema);
        properties.put("fileOperations", fileOpsSchema);

        responseSchema.put("properties", properties);
        responseSchema.put("required", List.of("explanation", "fileOperations"));
        
        generationConfig.put("responseSchema", responseSchema);
        requestMap.put("generationConfig", generationConfig);

        String jsonBody = objectMapper.writeValueAsString(requestMap);
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json; charset=utf-8"));

        // We use gemini-1.5-flash for faster responsiveness during generation
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Gemini API call failed with code " + response.code() + " and message " + response.message());
            }

            String responseString = response.body().string();
            JsonNode rootNode = objectMapper.readTree(responseString);
            
            // Extract text response from Gemini contents
            String aiText = rootNode.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            if (aiText == null || aiText.trim().isEmpty()) {
                throw new IOException("Gemini returned empty response: " + responseString);
            }

            return objectMapper.readValue(aiText, AIResponse.class);
        }
    }

    private AIResponse generateMockResponse(String prompt) {
        String lower = prompt.toLowerCase();
        List<AIResponse.FileOperation> ops = new ArrayList<>();
        String explanation;

        if (lower.contains("landing") || lower.contains("homepage") || lower.contains("website")) {
            explanation = "I created a stunning, modern SaaS Landing Page with glassmorphism aesthetics, a hero banner, dynamic feature cards, and interactive hover states.";
            
            String indexCss = """
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
                    
                    :root {
                      font-family: 'Plus Jakarta Sans', sans-serif;
                      background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
                      color: #f8fafc;
                      margin: 0;
                      min-height: 100vh;
                    }
                    
                    .glass-card {
                      background: rgba(255, 255, 255, 0.03);
                      backdrop-filter: blur(12px);
                      border: 1px border rgba(255, 255, 255, 0.08);
                      border-radius: 16px;
                      transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .glass-card:hover {
                      transform: translateY(-4px);
                      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
                    }
                    """;

            String appJsx = """
                    import React from 'react';
                    
                    export default function App() {
                      return (
                        <div className="min-h-screen flex flex-col items-center justify-center px-4">
                          <header className="w-full max-w-6xl py-6 flex justify-between items-center">
                            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                              Craftly.ai
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition">
                              Get Started
                            </button>
                          </header>
                          
                          <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl py-20">
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                              Build Stunning Web Apps <br />
                              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                in Seconds
                              </span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl">
                              Leverage state of the art AI generation to deploy responsive web interfaces with full styling, code structuring, and cloud previews automatically.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
                              <div className="glass-card p-8 text-left">
                                <div className="text-3xl mb-4">🚀</div>
                                <h3 className="text-xl font-semibold mb-2">Instant Generation</h3>
                                <p className="text-slate-400 text-sm">Describe what you want, and watch our LLM generate clean React components instantly.</p>
                              </div>
                              <div className="glass-card p-8 text-left">
                                <div className="text-3xl mb-4">✨</div>
                                <h3 className="text-xl font-semibold mb-2">Premium Design</h3>
                                <p className="text-slate-400 text-sm">Vibrant color palettes, glassmorphism cards, and fluid layouts come configured out of the box.</p>
                              </div>
                              <div className="glass-card p-8 text-left">
                                <div className="text-3xl mb-4">⚡</div>
                                <h3 className="text-xl font-semibold mb-2">Cloud Previews</h3>
                                <p className="text-slate-400 text-sm">Deploy and preview your project immediately inside independent preview environments.</p>
                              </div>
                            </div>
                          </main>
                        </div>
                      );
                    }
                    """;

            ops.add(new AIResponse.FileOperation("CREATE_OR_UPDATE", "src/index.css", indexCss));
            ops.add(new AIResponse.FileOperation("CREATE_OR_UPDATE", "src/App.jsx", appJsx));
        } else {
            String filename = extractFilenameFromPrompt(prompt, "CustomComponent.jsx");
            String path = "src/components/" + filename;
            String componentName = filename.substring(0, filename.lastIndexOf('.'));
            
            explanation = "I processed your request: '" + prompt + "' and created/updated a custom component '" + filename + "' tailored to your prompt.";
            
            String componentCode = String.format("""
                    import React from 'react';
                    
                    /**
                     * Custom component built for: "%s"
                     */
                    export default function %s() {
                      return (
                        <div style={{ padding: '24px', background: '#1e293b', borderRadius: '12px', color: '#f1f5f9' }}>
                          <h2 style={{ margin: '0 0 12px 0' }}>%s</h2>
                          <p style={{ color: '#94a3b8' }}>Created in response to prompt: <strong>%s</strong></p>
                        </div>
                      );
                    }
                    """, prompt, componentName, componentName, prompt);

            ops.add(new AIResponse.FileOperation("CREATE_OR_UPDATE", path, componentCode));
        }

        return new AIResponse(explanation, ops);
    }

    private AIResponse generateMockStreamingResponse(String prompt, Consumer<String> tokenConsumer) {
        AIResponse response = generateMockResponse(prompt);
        if (tokenConsumer != null && response.explanation() != null) {
            String[] words = response.explanation().split(" ");
            for (String word : words) {
                tokenConsumer.accept(word + " ");
                try {
                    Thread.sleep(40);
                } catch (InterruptedException ignored) {}
            }
        }
        return response;
    }

    private AIResponse callGeminiStreamingAPI(Long projectId, String prompt, List<ChatMessageResponse> history, Consumer<String> tokenConsumer) throws IOException {
        String systemInstruction = """
                You are a senior frontend software engineer building modern React/CSS/HTML code for the user.
                Always respond in the exact JSON format specified by the response schema.
                Do not include markdown or backticks in the raw JSON HTTP response itself.
                
                The JSON response MUST match this structure:
                {
                  "explanation": "A concise user-facing description of what you did.",
                  "fileOperations": [
                    {
                      "type": "CREATE_OR_UPDATE",
                      "path": "src/components/Button.jsx",
                      "content": "raw file content text"
                    }
                  ]
                }
                """;

        StringBuilder workspaceContext = new StringBuilder("Current Project Files:\n");
        List<ProjectFile> dbFiles = projectFileRepository.findByProjectId(projectId);
        for (ProjectFile file : dbFiles) {
            workspaceContext.append("--- File: ").append(file.getPath()).append(" ---\n");
            try {
                String content = storageService.get(file.getMinioObjectKey());
                workspaceContext.append(content).append("\n");
            } catch (Exception e) {
                workspaceContext.append("[Error loading file content]\n");
            }
        }

        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append("SYSTEM INSTRUCTION:\n").append(systemInstruction).append("\n\n");
        fullPrompt.append("WORKSPACE FILES:\n").append(workspaceContext).append("\n\n");
        fullPrompt.append("CHAT HISTORY:\n");
        for (ChatMessageResponse message : history) {
            fullPrompt.append("- ").append(message.role()).append(": ").append(message.content()).append("\n");
        }
        fullPrompt.append("\nLATEST USER PROMPT: ").append(prompt);

        Map<String, Object> requestMap = new HashMap<>();
        List<Map<String, Object>> contentsList = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> partsList = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", fullPrompt.toString());
        partsList.add(partMap);
        contentMap.put("parts", partsList);
        contentsList.add(contentMap);
        requestMap.put("contents", contentsList);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");

        Map<String, Object> responseSchema = new HashMap<>();
        responseSchema.put("type", "OBJECT");
        Map<String, Object> properties = new HashMap<>();
        
        Map<String, Object> expSchema = new HashMap<>();
        expSchema.put("type", "STRING");
        properties.put("explanation", expSchema);

        Map<String, Object> fileOpsSchema = new HashMap<>();
        fileOpsSchema.put("type", "ARRAY");
        Map<String, Object> itemSchema = new HashMap<>();
        itemSchema.put("type", "OBJECT");
        Map<String, Object> itemProps = new HashMap<>();
        
        Map<String, Object> typeSchema = new HashMap<>();
        typeSchema.put("type", "STRING");
        typeSchema.put("enum", List.of("CREATE_OR_UPDATE", "DELETE"));
        itemProps.put("type", typeSchema);
        
        Map<String, Object> pathSchema = new HashMap<>();
        pathSchema.put("type", "STRING");
        itemProps.put("path", pathSchema);
        
        Map<String, Object> contentSchema = new HashMap<>();
        contentSchema.put("type", "STRING");
        itemProps.put("content", contentSchema);

        itemSchema.put("properties", itemProps);
        itemSchema.put("required", List.of("type", "path", "content"));
        fileOpsSchema.put("items", itemSchema);
        properties.put("fileOperations", fileOpsSchema);

        responseSchema.put("properties", properties);
        responseSchema.put("required", List.of("explanation", "fileOperations"));
        generationConfig.put("responseSchema", responseSchema);
        requestMap.put("generationConfig", generationConfig);

        String jsonBody = objectMapper.writeValueAsString(requestMap);
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json; charset=utf-8"));

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=" + apiKey;

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        StringBuilder fullTextBuilder = new StringBuilder();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Gemini Streaming API call failed with code " + response.code() + " and message " + response.message());
            }

            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(response.body().byteStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String jsonChunk = line.substring(6).trim();
                        if (jsonChunk.equals("[DONE]")) break;
                        try {
                            JsonNode node = objectMapper.readTree(jsonChunk);
                            String textPart = node.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
                            if (!textPart.isEmpty()) {
                                fullTextBuilder.append(textPart);
                                if (tokenConsumer != null) {
                                    tokenConsumer.accept(textPart);
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
        }

        String fullText = fullTextBuilder.toString();
        if (fullText.isEmpty()) {
            throw new IOException("Gemini returned empty streaming response.");
        }

        return objectMapper.readValue(fullText, AIResponse.class);
    }


    private String extractFilenameFromPrompt(String prompt, String defaultName) {
        if (prompt == null) return defaultName;
        // Search for word boundaries ending with .jsx, .tsx, .js, .css, .html
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\b(\\w+\\.(jsx|tsx|js|css|html))\\b", java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return defaultName;
    }
}
