import axiosInstance from '@/api/axiosInstance';

/**
 * Chatbot Service
 * Handles all chatbot-related API calls
 */
class ChatbotService {
  /**
   * Send message to chatbot
   * @param {string} message - User message
   * @returns {Promise<string>} - Bot response message
   */
  async sendMessage(message) {
    try {
      const response = await axiosInstance.post('/enhanced-ai/chatbot', {
        message: message.trim()
      }, {
        timeout: 40000 // 40-second timeout as specified
      });

      if (response.data.success) {
        return response.data.data.message;
      } else {
        throw new Error(response.data.error || 'Failed to get response from chatbot');
      }
    } catch (error) {
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error("I'm taking longer than usual to respond. Please try again or check back shortly.");
      }
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 'Server error occurred';
        throw new Error(errorMessage);
      }
      
      if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Other errors
      throw new Error(error.message || 'An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Get conversation history (if needed in future)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Conversation history
   */
  async getConversationHistory(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get('/enhanced-ai/conversations', {
        params: { page, limit }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get conversation history');
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
