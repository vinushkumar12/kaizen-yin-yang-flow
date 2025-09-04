import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BackendMLService } from './src/lib/backendML';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize ML service
const mlService = BackendMLService.getInstance();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kaizen ML Backend is running' });
});

// Enhanced sentiment and emotion analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const analysis = await mlService.analyzeSentimentAndEmotion(text);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Advanced theme extraction
app.post('/api/themes', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const themes = await mlService.extractAdvancedThemes(text);
    
    res.json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error('Theme extraction error:', error);
    res.status(500).json({ 
      error: 'Theme extraction failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Generate personalized prompts
app.post('/api/prompts', async (req, res) => {
  try {
    const { recentEntries, currentMood, userGoals, dominantEmotion } = req.body;
    
    if (!recentEntries || currentMood === undefined || !userGoals || !dominantEmotion) {
      return res.status(400).json({ error: 'All parameters are required' });
    }

    const prompt = await mlService.generatePersonalizedPrompt(
      recentEntries,
      currentMood,
      userGoals,
      dominantEmotion
    );
    
    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ 
      error: 'Prompt generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Analyze writing patterns
app.post('/api/patterns', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries array is required' });
    }

    const patterns = await mlService.analyzeWritingPatterns(entries);
    
    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({ 
      error: 'Pattern analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Generate summaries
app.post('/api/summary', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries array is required' });
    }

    const summary = await mlService.generateSummary(entries);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ 
      error: 'Summary generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Batch analysis endpoint for multiple entries
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries array is required' });
    }

    const results = [];
    
    for (const entry of entries) {
      const analysis = await mlService.analyzeSentimentAndEmotion(entry.content);
      const themes = await mlService.extractAdvancedThemes(entry.content);
      
      results.push({
        id: entry.id,
        analysis,
        themes
      });
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ 
      error: 'Batch analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kaizen ML Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Hugging Face API Key: ${process.env.HUGGINGFACE_API_KEY ? 'Configured' : 'Missing'}`);
});

export default app;
