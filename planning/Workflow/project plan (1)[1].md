1. Copy the assignment question and submit it tothe chatgpt.
2. Use chat GPT reason And right command explain this assignment in detail without adding additional features. 
## Prompt for explaining assignment 
    Explain the following assignment in detail. if any requirement is underspecified or too complex to implement, make the minimal reasonable assumptions required and list each assumption at the end. Do not suggest any new features or additions—only explain what is already written or reasonably assumed. Break it down thoroughly by feature, user flow, and technical requirements as described in the original assignment


### 1. Database Design (with Assumptions + Attached File)

> **Prompt #1:**
> “Here’s my assignment which defines my authentication/user‑profile schema.
>
> * **Design the full relational database schema** (tables, columns, types, relations, indexes) to cover exactly:
>
>   1. All auth & user tables/fields as specified.
>   2. All domain tables needed by the prd doc.
> * **If any requirement is underspecified or too complex to implement**, make only the ** reasonable assumptions**, and **list each assumption** at the end. Make sure these assumptions should not affect all of our core functionalties of prd doc.
> * **Do not add any extra tables or columns** beyond what the prd doc require.
>   **Output:** Complete SQL DDL script.”

---

### 2. UI Details (with Assumptions + Attached File)

> **Prompt #2:**

> * Include all domain‑specific screens (forms, lists, detail views, dashboards, etc.) exactly as the schema allows.
> * **Where the assignment or file leaves UI behavior or fields unclear**, ask me questions where not clarified donot make ur own decisions. Make sure the provided solutions will not affect the flow.
>   **Do not introduce** any features not supported by the prd  or datbase schema design.”

---

### 3. UI Flow (with Assumptions + Attached File)

> **Prompt #3:**
> “Now map the **screen‑to‑screen navigation** for the entire app:
>
> * Start with the auth screens (e.g. login, signup, forgot/reset, profile).
> * Then the domain‑specific screens from your schema .
> * For each transition (button, link, menu or any other user action), specify exactly which element leads where.
> * **If any transition is unspecified**, discuss with me for clarifications. Make sure it doesnt affect the code flow.
>   **Do not add** any extra screens beyond what the prd imply.”

---

### 4. API Flow

> **Prompt #4:**
> “Based on above UI flow, specify the exact **API call** (method, endpoint, headers, request & response bodies) needed. Mention headers, request, response, query parameters, and other details as needed, mention the sample request response body, error lists. 
>
> * Tie each endpoint back to one or more tables in your schema.
> * **If any details (error cases, parameters) are missing**, invent only the **most obvious** ones, and **document each assumption** at the end.
>   **Do not create** any endpoints beyond those required by the prd and database. 

### UI-API mapping details info

> **Prompt #5:**
> Give detailed UI flow with api mapping consisting of the following:
    * Request body, response body, headers, parameters
> You are going to produce a step-by-step mapping of every user interface screen and action in our React app to its corresponding backend API call. Do not assume anything—inspect the actual code if needed and capture every detail. Follow these instructions exactly:

2. Overall Flow Outline
   - List each screen in order (e.g. Home → Login → Dashboard → Settings → Checkout → Confirmation).

3. For each screen, do the following:

   A. Screen Identification
   • Screen Name:  


   B. User Actions on This Screen  
   For every clickable or form action (e.g., button click, form submit, link navigation):
   1. Action Name (e.g. “Click ‘Place Order’ button”)  
   2. UI Event Handler (e.g. handlePlaceOrder)  
   3. Component or Hook (e.g. OrderForm.tsx)

   C. Associated API Call  
   1. HTTP Method & Endpoint (e.g. POST /api/orders)  
   2. Request Headers (e.g. Content-Type: application/json, Authorization)  
   3. Request Parameters  
      - URL/query parameters  
      - Path parameters  
   4. Request Body Schema  
      json
      {
        "userId": "string",
        "items": [ { "id": "string", "quantity": number } ],
        // etc.
      }
      
   5. Expected Response Schema  
      json
      {
        "orderId": "string",
        "status": "string",
        "total": number
      }
      

   D. UI Consumption of Response  
   1. How the response data is stored or passed (e.g. Redux action, React state)  
   2. Which components or views update (e.g. show confirmation message, update cart badge)  
   3. Any subsequent navigation or side-effects (e.g. redirect to /confirmation)

4. Validation & Error Paths  
   - For each API call, describe how validation errors or server errors are handled in the UI (e.g. error toast, inline error messages).

5. Completion Criteria  
   - Ensure no action or API is missed. Double-check handlers, services, and utility functions.

6. Output Format  
   - Produce a numbered or bulleted markdown document, grouped by screen, then by action.


7. UI should not show any kind of api failed errors but it can console errors.

<!-- 
---
Just replace `auth_template.md` with your actual file name (e.g. `auth_template.md`) and paste the assignment text when you run each prompt. This pipeline guarantees a **consistent, end‑to‑end** design—from data to UI to navigation to APIs—while surfacing any assumptions you had to make. -->
