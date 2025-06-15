# Chatbot Manual Testing Checklist

## 🔐 **Role-Based Access Control Testing**

### **Test 1: Employee Access (Should Work)**
- [ ] Login as employee user
- [ ] Verify "AI Chatbot" appears in sidebar navigation
- [ ] Click "AI Chatbot" button in sidebar
- [ ] Verify navigation to `/ai-chatbot` page works
- [ ] Verify page loads with Shubh header and welcome screen
- [ ] Verify no access denied messages appear

### **Test 2: Manager Access (Should Be Denied)**
- [ ] Login as manager user
- [ ] Verify "AI Chatbot" does NOT appear in sidebar navigation
- [ ] Manually navigate to `/ai-chatbot` URL
- [ ] Verify access denied page appears
- [ ] Verify message: "Access Denied - AI Chatbot is only available for employees"

### **Test 3: Admin Access (Should Be Denied)**
- [ ] Login as admin user
- [ ] Verify "AI Chatbot" does NOT appear in sidebar navigation
- [ ] Manually navigate to `/ai-chatbot` URL
- [ ] Verify access denied page appears
- [ ] Verify message: "Access Denied - AI Chatbot is only available for employees"

## 💬 **Chat Functionality Testing**

### **Test 4: Welcome Screen**
- [ ] Login as employee and navigate to chatbot
- [ ] Verify welcome screen displays with Shubh avatar
- [ ] Verify welcome message: "Hi! I'm Shubh - Your HR Assistant"
- [ ] Verify capabilities section shows 6 different HR functions
- [ ] Verify 5 quick action buttons are displayed
- [ ] Click each quick action button and verify message is sent

### **Test 5: Basic Chat Flow**
- [ ] Type a message in input field
- [ ] Press Enter to send message
- [ ] Verify user message appears on right side with blue background
- [ ] Verify typing indicator (3 dots) appears immediately
- [ ] Wait for bot response
- [ ] Verify bot message appears on left side with gray background and Shubh avatar
- [ ] Verify typing indicator disappears when response arrives

### **Test 6: Message Formatting**
- [ ] Send message and wait for response with **bold** text
- [ ] Verify bold text renders correctly
- [ ] Send message and wait for response with *italic* text
- [ ] Verify italic text renders correctly
- [ ] Send message and wait for response with bullet points
- [ ] Verify list formatting renders correctly

### **Test 7: Input Field Functionality**
- [ ] Verify input field has placeholder text
- [ ] Verify input field is focused on page load
- [ ] Type message and verify Send button becomes enabled
- [ ] Clear input and verify Send button becomes disabled
- [ ] Verify Enter key sends message
- [ ] Verify Shift+Enter does NOT send message (for multiline)

## ⚠️ **Error Handling Testing**

### **Test 8: Network Error Handling**
- [ ] Disconnect internet connection
- [ ] Send a message
- [ ] Verify appropriate error message appears
- [ ] Verify retry button appears on error message
- [ ] Reconnect internet and click retry button
- [ ] Verify message is resent successfully

### **Test 9: Server Error Handling**
- [ ] Stop backend server
- [ ] Send a message
- [ ] Verify server error message appears
- [ ] Verify retry button appears
- [ ] Restart server and test retry functionality

### **Test 10: Timeout Handling**
- [ ] Send a message that might take long to process
- [ ] Wait for 40 seconds
- [ ] Verify timeout error message appears
- [ ] Verify retry functionality works

## 📱 **Mobile Responsiveness Testing**

### **Test 11: Mobile Layout (375px width)**
- [ ] Open chatbot on mobile device or browser dev tools
- [ ] Verify header layout is responsive
- [ ] Verify message bubbles fit properly on screen
- [ ] Verify input field and send button are properly sized
- [ ] Verify typing indicator displays correctly
- [ ] Verify welcome screen is readable and functional

### **Test 12: Tablet Layout (768px width)**
- [ ] Test on tablet or medium screen size
- [ ] Verify all elements scale appropriately
- [ ] Verify touch interactions work smoothly
- [ ] Verify scrolling works properly

### **Test 13: Touch Interactions**
- [ ] Test tap to send message
- [ ] Test tap on quick action buttons
- [ ] Test tap on retry buttons
- [ ] Test scrolling through long conversations

## 🎨 **UI/UX Validation**

### **Test 14: Visual Design**
- [ ] Verify Shubh avatar displays correctly in header
- [ ] Verify Shubh avatar displays in bot messages
- [ ] Verify user messages have blue gradient background
- [ ] Verify bot messages have gray background
- [ ] Verify proper spacing between messages
- [ ] Verify timestamps display correctly

### **Test 15: Animations**
- [ ] Verify smooth message entrance animations
- [ ] Verify typing indicator bouncing animation
- [ ] Verify smooth scrolling to new messages
- [ ] Verify hover effects on buttons
- [ ] Verify no jarring transitions or jumps

### **Test 16: Auto-Scroll Behavior**
- [ ] Send multiple messages to create long conversation
- [ ] Verify chat auto-scrolls to bottom with new messages
- [ ] Scroll up to read old messages
- [ ] Send new message while scrolled up
- [ ] Verify chat scrolls to bottom for new message

## 🔧 **API Integration Testing**

### **Test 17: Real API Calls**
- [ ] Verify chatbot API endpoint is called correctly
- [ ] Verify JWT token is sent in Authorization header
- [ ] Verify request format matches API specification
- [ ] Verify response is parsed correctly
- [ ] Check browser network tab for proper API calls

### **Test 18: Different Query Types**
- [ ] Test policy-related questions
- [ ] Test personal data questions (leave balance, attendance)
- [ ] Test general HR questions
- [ ] Test out-of-scope questions
- [ ] Test unauthorized access attempts

### **Test 19: Response Handling**
- [ ] Verify successful responses display correctly
- [ ] Verify error responses show appropriate messages
- [ ] Verify markdown formatting in responses
- [ ] Verify long responses display properly

## 🌐 **Cross-Browser Compatibility**

### **Test 20: Chrome**
- [ ] Test all functionality in Chrome
- [ ] Verify animations work smoothly
- [ ] Verify API calls work correctly

### **Test 21: Firefox**
- [ ] Test all functionality in Firefox
- [ ] Verify CSS compatibility
- [ ] Verify JavaScript functionality

### **Test 22: Safari**
- [ ] Test all functionality in Safari
- [ ] Verify iOS Safari compatibility
- [ ] Verify touch interactions

### **Test 23: Edge**
- [ ] Test all functionality in Edge
- [ ] Verify Windows compatibility

## ♿ **Accessibility Testing**

### **Test 24: Keyboard Navigation**
- [ ] Navigate using Tab key only
- [ ] Verify input field is focusable
- [ ] Verify send button is focusable
- [ ] Verify retry buttons are focusable
- [ ] Test Enter key to send messages

### **Test 25: Screen Reader Compatibility**
- [ ] Test with screen reader software
- [ ] Verify ARIA labels are read correctly
- [ ] Verify chat messages are announced
- [ ] Verify form labels are descriptive

### **Test 26: High Contrast Mode**
- [ ] Enable high contrast mode
- [ ] Verify all text is readable
- [ ] Verify buttons are visible
- [ ] Verify focus indicators are clear

## 🚀 **Performance Testing**

### **Test 27: Long Conversations**
- [ ] Send 50+ messages in conversation
- [ ] Verify scrolling remains smooth
- [ ] Verify memory usage doesn't spike
- [ ] Verify animations remain fluid

### **Test 28: Quick Message Sending**
- [ ] Send multiple messages rapidly
- [ ] Verify all messages are processed
- [ ] Verify UI remains responsive
- [ ] Verify no race conditions occur

### **Test 29: Page Load Performance**
- [ ] Measure initial page load time
- [ ] Verify components load progressively
- [ ] Verify no unnecessary re-renders

## 🔄 **Edge Cases Testing**

### **Test 30: Empty Messages**
- [ ] Try to send empty message
- [ ] Verify send button is disabled
- [ ] Try to send message with only spaces
- [ ] Verify message is not sent

### **Test 31: Very Long Messages**
- [ ] Send very long message (1000+ characters)
- [ ] Verify message displays correctly
- [ ] Verify UI doesn't break

### **Test 32: Special Characters**
- [ ] Send messages with emojis
- [ ] Send messages with special characters
- [ ] Send messages with HTML/markdown
- [ ] Verify proper handling and display

### **Test 33: Session Management**
- [ ] Refresh page during conversation
- [ ] Verify conversation is reset (no persistence)
- [ ] Test with expired JWT token
- [ ] Verify proper error handling

## ✅ **Final Validation**

### **Test 34: Complete User Journey**
- [ ] Login as employee
- [ ] Navigate to chatbot
- [ ] Complete full conversation flow
- [ ] Test error scenarios
- [ ] Test retry functionality
- [ ] Logout and verify cleanup

### **Test 35: Production Readiness**
- [ ] Verify no console errors
- [ ] Verify no broken images or assets
- [ ] Verify proper error boundaries
- [ ] Verify graceful degradation

---

## 📋 **Testing Notes Template**

**Date:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**Device:** ___________  

**Issues Found:**
- [ ] Issue 1: Description
- [ ] Issue 2: Description
- [ ] Issue 3: Description

**Overall Assessment:**
- [ ] ✅ Ready for production
- [ ] ⚠️ Minor issues found
- [ ] ❌ Major issues found

**Additional Comments:**
_________________________________
