### **1. Project Overview**

#### **Objective**

To develop a comprehensive dashboard for tracking phone calls, downloading call recordings, accessing call transcripts, and configuring outbound call schedules. The application will utilize modern technologies such as Nuxt 3 on Deno 2, **NuxtUI v3** components, Tailwind CSS, and Lucide Icons to deliver a seamless user experience. Supabase will serve as the backend-as-a-service (BaaS), providing a scalable and robust database solution with additional features like real-time subscriptions and authentication.

#### **Target Audience**

Businesses and organizations that need detailed tracking and management of outbound and inbound phone calls, including analytics and scheduling capabilities.

#### **Key Outcomes**

1. A user-friendly dashboard to effectively monitor and manage phone call data.
2. Enhanced analytics features to gain insights into call performance and trends.
3. An efficient scheduling system for outbound calls with customizable settings.

---

### **2. Project Scope**

#### **2.1 Features**

1. **Call Tracking Dashboard**
   - View a list of all calls made, retrieved via REST API from Vapi.ai.
   - Filter calls by date, time, and other relevant parameters.

2. **Call Details View**
   - Access detailed information for each call, including:
     - Call transcript
     - Call summary
     - Tags (e.g., Already Called, Busy, No Response)
     - Voice recording playback and download options

3. **Analytics and Reporting**
   - Interactive charts displaying calls over time.
   - Breakdown of call statuses:
     - Successful connected calls
     - Dropped calls
     - Successfully completed calls
   - Tag-based analytics to categorize call outcomes, including:
     - **Already Called**
     - **Auto Debit**
     - **Busy/Call Back Later**
     - **Data Report**
     - **Failed Verification**
     - **Insurance Claim**
     - **No Response/Technical**
     - **Other Language**
     - **Repossessed Vehicle/Already Sell**
     - **Request Full Payment**
     - **Stop Calling**
     - **Tag Value**
     - **Wrong Number**
     - **Wrong Person**

4. **Outbound Call Scheduling**
   - Configuration interface to schedule outbound calls.
   - Upload lists of phone numbers.
   - Set calling hours and manage call queues.

5. **User Authentication and Authorization**
   - Secure login and account management using Supabase Auth.
   - Role-based access control for different user levels.

6. **Responsive UI Design**
   - Utilize **NuxtUI v3 components** and Tailwind CSS for a consistent and responsive interface.
   - Ensure compatibility across various devices and screen sizes.

7. **Localization and Accessibility**
   - Support for multiple languages if needed.
   - Compliance with accessibility standards (WCAG 2.1 AA).

#### **2.2 Technical Specifications**

- **Frontend Framework**: Nuxt 3 (Vue 3)
  - Utilizes Composition API and setup functions.
  - Implements Vue Router for dynamic routing.

- **Backend-as-a-Service (BaaS)**: Supabase
  - **Database**: PostgreSQL with support for pgvector for embedding indexing and search functionalities.
  - **Authentication**: Supabase Auth for secure user management.
  - **Real-time Capabilities**: Leverage Supabase Realtime for instant updates.
  - **Storage**: Supabase Storage for managing call recordings and transcripts.

- **Backend Runtime**: Deno 2
  - Secure and fast with native TypeScript support.
  - Employ Deno's capabilities for server-side rendering and API handling.

- **UI Component Library**: **NuxtUI v3**
  - Provides pre-built, customizable components optimized for Nuxt 3.
  - Integrated with Tailwind CSS for additional styling flexibility.

- **Icons**: Lucide Icons
  - A consistent and clean icon set for UI elements.

- **APIs**:
  - Integration with Vapi.ai for call data retrieval.
  - RESTful API design for data interactions.

#### **2.3 Non-Functional Requirements**

- **Performance**: Fast load times with optimized assets and efficient data handling.
- **Security**: Implement best practices, including encrypted connections and secure authentication mechanisms provided by Supabase.
- **Scalability**: Supabase offers scalable backend services to handle increasing amounts of data and concurrent users.
- **Maintainability**: Clean codebase with proper documentation for ease of updates and collaboration.

---

### **3. User Stories**

1. **Call Tracking**
   - *As a user*, I want to view and filter a list of calls so that I can monitor call activity effectively.

2. **Call Details Access**
   - *As a user*, I want to access detailed information about each call to understand the conversation and outcomes.

3. **Analytics Overview**
   - *As a user*, I want to see analytics and charts to gain insights into call performance over time.

4. **Outbound Call Scheduling**
   - *As a user*, I want to configure outbound call schedules to manage when calls are made.

5. **Data Download**
   - *As a user*, I want to download call recordings and transcripts for record-keeping and analysis.

6. **User Management**
   - *As an admin*, I want to manage user access levels to control who can view and modify certain data.

---

Certainly! Based on the project's requirements and functionalities outlined in the PRD, here's a suggested page structure for the **Call Tracking and Management Dashboard**:

---

### **Page Structure**

1. **Authentication**
   - **Login Page**
     - User login form
     - "Forgot Password" link
   - **Signup Page** *(if applicable)*
     - User registration form
   - **Password Reset Page**
     - Form to reset password via email link

2. **Main Dashboard**
   - **Overview Page**
     - Summary of recent call activities
     - Key metrics (e.g., total calls, successful calls, dropped calls)
     - Quick links to common actions
   - **Notifications Panel**
     - Recent alerts and notifications

3. **Call Management**
   - **Call List Page**
     - Table of all calls with sortable columns
     - Filters:
       - Date/Time range
       - Call status (connected, dropped, completed)
       - Tags (e.g., Busy, Wrong Number)
     - Search functionality
   - **Call Details Page**
     - Call information:
       - Caller and recipient details
       - Date and time of call
       - Duration
     - **Call Transcript**
       - Text transcript of the call
     - **Call Summary**
       - Automated or manual summary notes
     - **Tags**
       - List of tags associated with the call
       - Option to add or remove tags
     - **Voice Recording**
       - Playback controls
       - Download option
   - **Bulk Actions**
     - Select multiple calls for bulk tagging or exporting

4. **Analytics and Reporting**
   - **Analytics Dashboard**
     - Interactive charts and graphs
     - Metrics over time (daily, weekly, monthly views)
     - Breakdown of call outcomes
   - **Tag Analytics**
     - Visualization of calls by tags
     - Identify trends based on call reasons
   - **Custom Reports**
     - Generate and export custom reports
     - Schedule automated report generation

5. **Outbound Call Scheduling**
   - **Scheduling Overview**
     - Calendar view of scheduled calls
     - List of upcoming scheduled calls
   - **Create New Schedule**
     - Upload phone number list (CSV or Excel)
     - Set calling hours and time zones
     - Configure call retry logic
     - Assign specific tags or notes to the call batch
   - **Manage Schedules**
     - Edit or delete existing schedules
     - Pause or resume call campaigns
   - **Call Queue Management**
     - Real-time view of calls in the queue
     - Adjust priority of specific calls

6. **User Management** *(Admin Only)*
   - **User List Page**
     - List of all users with roles and statuses
     - Invite new users
   - **User Roles and Permissions**
     - Define roles (Admin, Manager, User)
     - Assign or modify user permissions
   - **User Profile Page**
     - Edit user information
     - Reset passwords
     - Activate or deactivate accounts

7. **Settings**
   - **Profile Settings**
     - Update personal information
     - Change password
     - Set language and time zone preferences
   - **Notification Settings**
     - Configure email and in-app notifications
     - Set preferences for alert types
   - **Integration Settings**
     - API keys management
     - Configure Vapi.ai integration details
     - Set up webhooks and callbacks
   - **Application Settings**
     - Customize dashboard themes (if applicable)
     - Manage data retention policies

8. **Help and Support**
   - **Help Center**
     - Access to tutorials and guides
     - FAQs
   - **Contact Support**
     - Submit support tickets
     - Live chat option (if available)
   - **Feedback**
     - Provide feedback or feature requests

9. **Legal and Compliance**
   - **Privacy Policy**
   - **Terms of Service**
   - **Compliance Documents**
     - Data protection and compliance certificates

10. **Miscellaneous**
    - **Notifications Center**
      - View all system notifications
    - **Search Page**
      - Global search across calls, contacts, and tags
    - **Error Pages**
      - 404 Page Not Found
      - 500 Internal Server Error
    - **Logout Page**
      - Confirmation and redirect to login

---

This structure ensures that users can intuitively navigate through the application, accessing all the necessary features for call tracking, management, analytics, and scheduling. Each primary function has dedicated pages, and related functionalities are grouped together for ease of use.

**Notes:**

- **Responsive Design:** Ensure all pages are optimized for various screen sizes, including desktops, tablets, and mobile devices.
- **Accessibility:** Incorporate accessibility features to comply with WCAG 2.1 AA standards.
- **Future Expansion:** The structure allows for additional features like machine learning analytics or expanded user roles without significant redesign.

**Next Steps:**

- **Wireframing:** Create wireframes for each page to visualize the layout and user flow.
- **User Flow Diagrams:** Map out how users will navigate between pages for common tasks.
- **Component Library Mapping:** Identify reusable components using NuxtUI v3 + Shadcn and Tailwind CSS for consistency across pages.


### **4. Technical Architecture**

- **Frontend**
  - **Nuxt 3**: For server-side rendering and a seamless SPA experience.
  - **NuxtUI v3 Components & shadcn-vue &  Tailwind CSS**: For building a responsive and consistent UI.
  - **Lucide Icons**: To enhance UI elements with clean and scalable icons.

- **Backend-as-a-Service**
  - **Supabase**:
    - **Database**: PostgreSQL with pgvector for advanced search capabilities.
    - **Authentication**: Secure user authentication and management.
    - **Storage**: Hosting and serving of call recordings and transcripts.
    - **Real-time**: Instant updates for call data and analytics.

- **Backend Runtime**
  - **Deno 2**: As the runtime environment for server-side operations.
  - **API Integration**: Connect with Vapi.ai for retrieving call data.
  - **Serverless Functions**: Use Supabase Edge Functions or Deno Deploy for custom backend logic.

- **Data Flow**
  - Call data fetched from Vapi.ai via REST API and stored in Supabase.
  - Supabase handles authentication, real-time data updates, and storage.
  - Frontend fetches data from Supabase APIs, displaying it in the dashboard.

- **Deployment**
  - Utilize platforms compatible with Deno and Supabase for deployment.
  - Implement CI/CD pipelines for automated testing and deployment.