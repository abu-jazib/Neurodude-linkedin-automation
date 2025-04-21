import express, { text } from 'express';
import { AzureOpenAI } from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';  
dotenv.config(); 

const router = express.Router();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const modelName = "gpt-4o";
const deployment = "gpt-4o"; 

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2024-04-01-preview";
const options = { endpoint, apiKey, deployment, apiVersion }
const apiKeyDalle = process.env.AZURE_OPENAI_API_KEY_DALLE;
// Azure OpenAI Client
const client = new AzureOpenAI(options);

// Generate text content
router.post('/generate-text', async (req, res) => {
  const { prompt, topic, toneOfVoice, contentType, maxTokens = 500 } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const enhancedPrompt = `
      You are a LinkedIn content creator. Your task is to generate a high-quality LinkedIn post based on the following details:
      Write a compelling LinkedIn post about ${topic} that is ${toneOfVoice || 'professional'}. The post should be ${contentType || 'informative'}, aimed at [target audience: e.g., startup founders, software engineers, job seekers, marketers, etc.]. 

      Make sure to:
      - Start with a strong hook that grabs attention in the first 1-2 lines.
      - Share personal experience, expert insight, or useful information.
      - Keep it clear, concise, and structured in short paragraphs for readability.
      - End with a thought-provoking conclusion or call to action that encourages engagement (e.g., a question, prompt to comment, or invitation to connect).
      Avoid using emojis or overly casual language.
      ${prompt}
    `;
    
    const result = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: enhancedPrompt }
      ],
      max_tokens: 4096,
      temperature: 1,
      top_p: 1,
      model: modelName
  });
    
    res.json({ 
      text: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Generate image
router.post('/generate-image', async (req, res) => {
  const { prompt, n = 1 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Step 1: Generate an image prompt based on LinkedIn-style request


    const imagePrompt = `Create a high-quality, professional-style illustration that visually represents the following LinkedIn post content:

    "${prompt}"

    The image should reflect the key themes and emotions conveyed in the post — such as [leadership, innovation, teamwork, personal growth — extract or infer based on content]. Use a modern, clean composition with realistic or semi-realistic characters, soft lighting, and a color palette suitable for a corporate or tech-savvy audience (e.g., blues, grays, whites). No text should appear in the image. The visual should be suitable for sharing on LinkedIn, conveying professionalism, clarity, and inspiration. and provide one image that captures the essence of the post.`;


    console.log('Generated image prompt:', imagePrompt);
    // Step 2: Use the generated prompt to create an image via Azure DALL·E
    const response = await axios.post(
      `https://neurodude-gpt.openai.azure.com/openai/deployments/dall-e-3/images/generations?api-version=2024-02-01`,
      {
        "prompt": imagePrompt,
        "model": "dall-e-3",
        "n": 1,
        "size": "1024x1024",
        "style": "vivid",
        "quality": "standard"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKeyDalle
        }
      }
    );

    const imageUrls = response.data.data.map(img => img.url);

    res.json({
      promptUsed: imagePrompt,
      images: imageUrls
    });

  } catch (error) {
    console.error('Azure OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});



export default router;