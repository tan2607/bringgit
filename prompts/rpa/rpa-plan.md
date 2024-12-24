**Project Overview**

This project aims to develop a headless browser-based Robotic Process Automation (RPA) solution using Browserbase's Node.js SDK. The solution will automate the process of checking Medicare eligibility on UnitedHealthcare's website for a mock patient in New York City.

**Objectives**

- Automate navigation to UnitedHealthcare's Medicare eligibility page.
- Input mock patient data to simulate the eligibility check workflow.
- Extract and log the eligibility results.

**Assumptions**

- The mock patient resides in New York City with ZIP code 10001.
- The patient's date of birth is January 1, 1959.

**Technical Stack**

1. **Frontend Framework**:
   - Nuxt 3 as the main framework
   - Vue 3 for component architecture
   - Nuxt UI v3 for UI components
   - Tailwind v4 for styling

2. **State Management**:
   - Vue 3 Composition API with `useState` for state management
   - Leverage Nuxt's built-in state management capabilities

3. **Development Tools**:
   - Bun as the package manager and runtime
   - TypeScript for type safety
   - ESLint and Prettier for code formatting

Note: All dependencies has already been installed.

**Technical Approach**

1. **Setup and Configuration**:
   - Initialize project with Nuxt 3
   - Install UI dependencies
   - Install RPA dependencies
   - Obtain API keys and project IDs from Browserbase.
   - Set up environment variables for secure access.

2. **Session Management**:
   - Create a new browser session using Browserbase's SDK.
   - Configure the session to run in stealth mode to avoid detection by anti-bot mechanisms.

3. **Navigation and Interaction**:
   - Navigate to UnitedHealthcare's Medicare eligibility page.
   - Input the mock patient's ZIP code and date of birth into the appropriate fields.
   - Submit the form to check eligibility.

4. **Data Extraction**:
   - Wait for the results page to load.
   - Extract the eligibility information displayed on the page.

5. **Logging and Reporting**:
   - Log the extracted eligibility information.
   - Handle any errors or exceptions that occur during the process.

6. **Session Termination**:
   - Properly close the browser session to free up resources.

**Implementation Steps**

1. **Install Dependencies**:
   ```bash
   # Initialize project with Nuxt 3
   bun create nuxt@latest

   # Install UI dependencies
   bun add @nuxt/ui@latest
   bun add @nuxtjs/tailwindcss@latest

   # Install RPA dependencies
   bun add @browserbasehq/sdk playwright-core
   ```

2. **Configure Environment Variables**:
   - Set `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` in your environment.

3. **Develop the Automation Script**:
   - Import necessary modules:
     ```javascript
     import { chromium } from 'playwright-core';
     import Browserbase from '@browserbasehq/sdk';
     ```
   - Initialize the Browserbase client:
     ```javascript
     const bb = new Browserbase({
       apiKey: process.env.BROWSERBASE_API_KEY,
     });
     ```
   - Create and connect to a browser session:
     ```javascript
     const session = await bb.sessions.create({
       projectId: process.env.BROWSERBASE_PROJECT_ID,
     });
     const browser = await chromium.connectOverCDP(session.connectUrl);
     const page = browser.contexts()[0].pages()[0];
     ```
   - Navigate to the Medicare eligibility page:
     ```javascript
     await page.goto('https://www.uhc.com/medicare/shop/medicare-advantage-plans/check-medicare-eligibility.html');
     ```
   - Input mock patient data:
     ```javascript
     await page.fill('input[name="zipCode"]', '10001');
     await page.fill('input[name="dob"]', '01/01/1959');
     ```
   - Submit the form and wait for results:
     ```javascript
     await page.click('button[type="submit"]');
     await page.waitForSelector('.eligibility-results');
     ```
   - Extract and log the eligibility information:
     ```javascript
     const eligibilityInfo = await page.textContent('.eligibility-results');
     console.log(eligibilityInfo);
     ```
   - Close the browser session:
     ```javascript
     await page.close();
     await browser.close();
     ```

4. **Implement the Automation Script using AI

```ts
import { test, expect } from '@playwright/test'
import { ai } from '@zerostep/playwright'

test.describe('Calendly', () => {
  test('book the next available timeslot', async ({ page }) => {
    await page.goto('https://calendly.com/zerostep-test/test-calendly')

    await ai('Verify that a calendar is displayed', { page, test })
    await ai('Dismiss the privacy modal', { page, test })
    await ai('Click on the first day in the month with times available', { page, test })
    await ai('Click on the first available time in the sidebar', { page, test })
    await ai('Click the Next button', { page, test })
    await ai('Fill out the form with realistic values', { page, test })
    await ai('Submit the form', { page, test })

    const element = await page.getByText('You are scheduled')
    expect(element).toBeDefined()
  })
})
```

## Generic Task Executor

```ts
import { test } from '@playwright/test'
import { ai } from '@zerostep/playwright'

let task = 'book the next available timeslot'
let url = 'https://calendly.com/zerostep-test/test-calendly'
let steps = `
Verify that a calendar is displayed
Dismiss the privacy modal
Click on the first day in the month with times available
Click on the first available time in the sidebar
Click the Next button
Fill out the form with realistic values
Submit the form
`

test(task, async ({ page }) => {
   await page.goto(url)

   // Split the steps into an array
   const stepsArray = steps.trim().split('\n')

   // Iterate over the steps and perform the actions
   for (const step of stepsArray) {
      await ai(step.trim(), { page, test })
   }
})
```

4. **Run the Script**:
   - Execute the Node.js script to perform the automated task.

**Testing and Validation**

- Test the script with various mock data inputs to ensure robustness.
- Validate that the extracted eligibility information matches expected results.
- Ensure proper error handling for scenarios like missing input fields or unexpected page layouts.

**References**

- Browserbase Node.js SDK Documentation: 
- UnitedHealthcare Medicare Eligibility Page: 

**Notes**

- Ensure compliance with UnitedHealthcare's terms automating interactions with their website.
- Monitor for any changes in the website's structure that may affect the automation script.

By following this plan, you can implement a headless browser-based RPA solution using Browserbase to automate the process of checking Medicare eligibility for a mock patient in New York City. 