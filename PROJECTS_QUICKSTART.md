# Projects Feature - Quick Start Guide

## What is the Projects Feature?

The Projects feature allows you to save project contexts so SenseUI can provide framework-specific and design-aligned AI feedback. Instead of explaining your tech stack every time, create a project profile once and reuse it across multiple feedback sessions.

## Getting Started

### 1. Create Your First Project

1. Open SenseUI
2. Navigate to **Projects** from the main navigation
3. Fill out the project form:
    - **Project Name**: Give it a memorable name (e.g., "Portfolio Website")
    - **Framework & Technologies**: List your stack (e.g., "React, Tailwind CSS, TypeScript")
    - **Desired Aesthetic**: Describe your visual direction (e.g., "Minimalist and professional")
    - **Website Type & Purpose**: What's it for? (e.g., "Portfolio website")
4. Click **Create Project**

Your project is now saved and will appear in the projects list!

### 2. Use Your Project in Chat

1. Go back to the **Chat** page
2. At the top of the chat interface, you'll see the **Active Project** dropdown
3. Select your newly created project from the list
4. A system message will confirm the project is loaded
5. Start chatting! All AI responses will now consider your project context

### 3. Example Usage

**Without Projects:**

```
You: /describe
AI: The page has a blue header with white text...
```

**With Projects (React + Tailwind CSS):**

```
You: /describe
AI: The page has a blue header with white text. Consider using Tailwind's
bg-blue-600 class for consistency. The layout could benefit from React
component structure...
```

## Managing Projects

### Edit a Project

1. Go to the **Projects** page
2. Find the project you want to edit
3. Click **Edit**
4. Update the fields
5. Click **Save Changes**

If the project is currently active, changes apply immediately!

### Delete a Project

1. Go to the **Projects** page
2. Find the project you want to remove
3. Click **Delete**
4. Confirm the deletion in the dialog

If you delete the active project, the system will switch to "No project selected".

### Switch Between Projects

You can switch projects anytime from the Chat page:

1. Use the **Active Project** dropdown
2. Select a different project
3. Your chat history stays visible
4. New AI responses will use the new project's context

### Clear Project Context

To go back to generic feedback mode:

1. On the Chat page, open the **Active Project** dropdown
2. Select **No project selected**
3. AI will resume providing generic feedback

## Tips for Best Results

### Be Specific with Frameworks

❌ Poor: "JavaScript"  
✅ Good: "React, Next.js 14, Tailwind CSS, TypeScript"

The more specific you are, the better AI can tailor suggestions.

### Describe Your Aesthetic Clearly

❌ Poor: "Nice looking"  
✅ Good: "Minimalist and professional with bold typography"

This helps AI align design recommendations with your vision.

### Define Your Purpose

❌ Poor: "Website"  
✅ Good: "E-commerce platform for handmade crafts"

Context about the website's purpose helps AI prioritize relevant feedback.

## Common Workflows

### Working on Multiple Projects

1. Create a project for each website you're building
2. Switch between them as you work on different sites
3. Projects are saved permanently until you delete them

### Evolving Projects

As your project evolves:

1. Edit the project to update frameworks or aesthetic
2. Changes apply immediately if the project is active
3. No need to create a new project

### Sharing Context with AI

When asking custom questions:

- Project context is automatically included
- You don't need to repeat your tech stack
- AI will consider your frameworks when answering

## Example Projects

Here are some example project configurations:

### E-commerce Store

- **Name**: My Online Shop
- **Frameworks**: Shopify Liquid, JavaScript, SCSS
- **Aesthetic**: Modern and vibrant with playful colors
- **Purpose**: E-commerce platform for clothing

### Portfolio Site

- **Name**: Personal Portfolio
- **Frameworks**: HTML, CSS, Vanilla JavaScript
- **Aesthetic**: Minimalist and professional
- **Purpose**: Portfolio website

### SaaS Dashboard

- **Name**: Analytics Dashboard
- **Frameworks**: React, Material-UI, TypeScript, Chart.js
- **Aesthetic**: Corporate and formal with data visualization focus
- **Purpose**: SaaS product dashboard

## Troubleshooting

**Q: My project isn't showing in the dropdown**  
A: Navigate to the Projects page to verify it was saved. The dropdown loads on page refresh.

**Q: AI isn't considering my project context**  
A: Check that the project is selected in the Active Project dropdown. A system message should confirm when loaded.

**Q: Can I use projects across different browsers?**  
A: No, projects are stored locally in your browser. You'll need to recreate them in other browsers.

**Q: How do I know if a project is active?**  
A: The Active Project dropdown will show the selected project's name. If it shows "No project selected", no context is active.

## Keyboard Shortcuts & Accessibility

- **Tab** to navigate through form fields and buttons
- **Enter** to submit forms
- **Escape** to close dialogs
- All actions announced to screen readers
- Full ARIA label support for assistive technology

## Need Help?

For more information about SenseUI features, visit the **Help** page from the main navigation.

---

**Remember**: Projects make SenseUI smarter about your specific needs. The more accurate your project context, the better the AI feedback!
