// Simple test to check basic functionality
console.log('🧪 Starting simple test...');

try {
  // Load environment
  require('dotenv').config();
  console.log('✅ Environment loaded');
  
  // Test basic requires
  const express = require('express');
  console.log('✅ Express loaded');
  
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  console.log('✅ Google AI loaded');
  
  // Test database connection
  const { connectDB } = require('./config/database');
  console.log('✅ Database config loaded');
  
  // Test AI service
  console.log('🤖 Testing AI Service...');
  const AIService = require('./services/AIService');
  const aiService = new AIService();
  console.log('✅ AI Service loaded');
  
  console.log('✅ All basic tests passed');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
