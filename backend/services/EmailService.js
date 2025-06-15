const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send feedback email to employee
   * @param {string} employeeEmail - Employee's email address
   * @param {string} employeeName - Employee's full name
   * @param {Object} feedbackData - Feedback data object
   * @param {string} managerName - Manager's full name
   * @returns {Promise} Email sending result
   */
  async sendFeedbackEmail(employeeEmail, employeeName, feedbackData, managerName) {
    const { feedbackType, generatedFeedback, suggestions } = feedbackData;
    
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📝 New Feedback Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Performance Feedback from Your Manager</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hello ${employeeName},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have received new <strong>${feedbackType}</strong> feedback from your manager, <strong>${managerName}</strong>.
          </p>
          
          <!-- Feedback Content -->
          <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-top: 0; display: flex; align-items: center;">
              <span style="background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px;">💬</span>
              Feedback:
            </h3>
            <p style="color: #555; line-height: 1.8; margin: 0; font-size: 15px;">${generatedFeedback}</p>
          </div>
          
          ${suggestions && suggestions.length > 0 ? `
            <!-- Suggestions -->
            <div style="background: linear-gradient(135deg, #f0fff4 0%, #e8f5e8 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h3 style="color: #333; margin-top: 0; display: flex; align-items: center;">
                <span style="background: #28a745; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px;">💡</span>
                Suggestions for Improvement:
              </h3>
              <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
                ${suggestions.map(suggestion => `<li style="margin-bottom: 8px; font-size: 15px;">${suggestion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <!-- Call to Action -->
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107; text-align: center;">
            <p style="color: #856404; margin: 0; font-size: 15px; font-weight: 500;">
              💬 <strong>Want to discuss this feedback?</strong><br>
              Feel free to schedule a meeting with ${managerName} to discuss your development plan.
            </p>
          </div>
          
          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <div style="text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
              This is an automated message from <strong>HRMS AI System</strong>.<br>
              Please do not reply to this email. For any questions, contact your manager directly.
            </p>
            <p style="color: #ccc; font-size: 11px; margin: 10px 0 0 0;">
              Sent on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'HRMS AI System',
        address: process.env.FROM_EMAIL || process.env.EMAIL_USER
      },
      to: employeeEmail,
      subject: `📝 New ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} Feedback from ${managerName}`,
      html: emailTemplate
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Feedback email sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        recipient: employeeEmail,
        subject: mailOptions.subject
      };
    } catch (error) {
      console.error('❌ Failed to send feedback email:', error);
      throw new Error(`Failed to send feedback email: ${error.message}`);
    }
  }

  /**
   * Test email configuration
   * @returns {Promise} Test result
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return { success: true, message: 'Email service is configured correctly' };
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      throw new Error(`Email service configuration error: ${error.message}`);
    }
  }
}

module.exports = EmailService;
