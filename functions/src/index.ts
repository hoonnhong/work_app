/**
 * Firebase Cloud Functions for Gemini API calls
 *
 * This file contains serverless functions that securely call the Gemini API
 * without exposing the API key to the client.
 */

import {onRequest} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";

/**
 * Main Cloud Function endpoint for Gemini API calls
 *
 * Request body format:
 * {
 *   "prompt": string,
 *   "model": string,
 *   "responseType": "text" | "json"
 * }
 */
export const callGemini = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request, response) => {
    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      const {prompt, model, responseType = "text"} = request.body;

      if (!prompt || !model) {
        response.status(400).json({
          error: "Missing required fields: prompt and model",
        });
        return;
      }

      // Get API key from environment variable
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        response.status(500).json({
          error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
        });
        return;
      }

      // Initialize Gemini AI client
      const genAI = new GoogleGenerativeAI(apiKey);
      const generativeModel = genAI.getGenerativeModel({model});

      // Generate content
      const result = await generativeModel.generateContent(prompt);
      const text = result.response.text();

      // Parse response based on type
      if (responseType === "json") {
        try {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonText = jsonMatch ? jsonMatch[1] : text;
          const parsedData = JSON.parse(jsonText.trim());
          response.json({success: true, data: parsedData});
        } catch (parseError) {
          // If JSON parsing fails, try to clean and parse again
          const cleanedText = text
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            .trim();
          try {
            const parsedData = JSON.parse(cleanedText);
            response.json({success: true, data: parsedData});
          } catch {
            response.status(500).json({
              error: "Failed to parse JSON response",
              rawText: text,
            });
          }
        }
      } else {
        response.json({success: true, data: text});
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      response.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }
);
