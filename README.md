# SenseUI

SenseUI is an open-source Chromium extension that gives blind and low-vision web developers real-time, actionable feedback on their web designs. Get visual descriptions of your pages and receive design recommendations without relying on sighted friends or colleagues. I'm making this project as part of my master's thesis in Human-Computer Interaction, but this repository will not be deleted or closed after the completion of my degree. It will remain open-source and everyone is free to fork it, change it, adapt and use freely.

We are actively looking forbBlind and low-vision developers to test and provide feedback. Participation is flexible and optional. You can participate in as many Sprints as you can. For more details go to [How to Contribute](#how-to-contribute)

Current State: Sprint 1 (Foundation)

Join the mailing list for development updates: 

[SenseUI mailing list](https://www.freelists.org/list/sense-ui)


---

## Table of Contents
1. [Planned Features](#planned-features)
2. [Roadmap](#roadmap)
3. [How to Contribute](#how-to-contribute)  
4. [Installation](#installation)  
5. [Documentation](#documentation)  
6. [Project Background](#project-background)  
7. [License](#license)  
8. [Contact](#contact)

---

## Planned Features
### Core features
1. Accessible, screen-reader friendly interface

2. Keyboard shortcuts such as (Ctrl + Shift + S) to open extension and other common actions.

3. Quick-prompts for tasks such as Generate visual description and Identify design issues

5. Download chat session

6. Session persistence across browser restarts

7. Settings page
    - Adjust feedback detail level:
        - Comprehensive — with code examples and explanations that encourage learning visual design best practices and concepts
        - Balanced (default)
        - Concise — offers straightforward answers and doesn’t explain concepts or provide code snippets
    - Text input for additional context or instructions
    - Chat download settings: 
        - Download entire chat
        - Download only favorited messages

8. Structured, navigable feedback
    - Responses organized with semantic headings to switch easily between conversation turns
    - Bullet points for lists instead of dense text blocks
    - Feedback goes from general to specific
    - Numerical values and specific code parameters highlighted
    - Clear explanations of why recommendations are made (unless concise mode is on)

9. About page 
    - Accessibility statement
    - User manual

### “Nice to have” features

1. Context files: option to upload to add project or brand guidelines to enhance feedback accuracy

2. Individual response confidence level
    - High, Regular and Low for each of SenseUI’s response
    - These levels depend on the availability of context files in the Settings (instructions or reference files such as PRDs or design guidelines)

3. Chat download different formats (not just .txt)


## Example use cases:
- Generate visual descriptions of your webpage without uploading screenshots

- Identify design issues (alignment, readability, contrast)

- Get actionable design recommendations (no vague "choose a bolder color" type of comments)

- Review your changes in real time

- Customize your feedback detail level and focus

- Download chat history for team sharing

---

## Roadmap

Disclaimer: The following are my initial guesses and not strict timelines

### Sprint 1: Foundation & Accessibility (until end of October)

The goal for this sprint is to establish the core infrastructure: accessible interface with keyboard navigation, the keyboard shortcut to open the extension, quick prompts and semantic headings to each of the conversation turns for easy navigation. No AI integration at this point yet. 

### Sprint 2: Core Functionality and AI integration (Current)

- AI Keys input from the settings page
- AI-generated responses based on HTML/CSS and screenshots of the active tab

### Sprint 3: Customization (December 7 - 22)

- Settings page
- More details soon

### Holiday Break 
From Dec 22 to January 4 

### Sprint 4: Collaboration (January 4 - 16)
Chat download, team sharing, documentation

### Sprint 5: Polish and feedback loop (January 19 - 31)
Nice-to-have's and newer features (if time allows), edge cases

### More details

For detailed progress, visit the [SenseUI GitHub issues page](https://github.com/reginacas/sense-ui/issues)

Look for the issue pinned

---

## How to Contribute

### As a Tester

Testers help us find issues and improve accessibility. Requirements:

- You use a screen reader (NVDA, JAWS, VoiceOver)
- You have experience or are learning web development
- You can spend around 30 minutes testing it, every 2 to 3 weeks until the end of January approximately

At the start of each sprint, I create a tracking issue with features to test (labeled "current-sprint") with:
- What features are in this sprint
- What to look for when testing. 
You download the Release, test it, and comment on what works and what breaks, suggest improvements, share words of encouragement, etc.

### As a Developer

If your heart desires, you can contribute code, fix bugs, or propose features.
Simply fork the repository, make your changes and start a pull request.
[Contact me](#contact) for any questions you have.

### Data Protection

If you decide to participate and become part of the research study, you can read about how your personal data will be handled here: [Data protection](DATA_PROTECTION.md) 

You can choose to remain anonymous, or if you are comfortable sharing your name, I would be happy to aknowledgement and credit your contributions in any published papers that come out of this project.

To read more details, visit the [Contributing page](CONTRIBUTING.md)

---

## Installation

To learn how to install SenseUI, go to the [Setup Guide](SETUP.md)

---

## Documentation

### How to Use SenseUI

SenseUI is a chat interface. You ask it questions about your webpage and it responds with feedback.

#### Keyboard shortcuts:
- Ctrl + Shift + S: Open SenseUI
- Tab: Move between elements
- Add commands in the chatbox by typing "/"

#### Quick action prompts: 
- Write / in the text input
- Choose from the options in the dropdown

Type custom questions in the chat field anytime.

### Code of Conduct

All participants agree to follow our Code of Conduct: [Link to Code of Conduct](CODE_OF_CONDUCT.md)

---

## Project Background

SenseUI started from research on barriers blind and low-vision developers face when working on UI design. Many rely on sighted colleagues, expensive services or vague general-purpose AI tools to verify their work. Due to this, many decide to distance themselves from UI and focus on Back-end roles, limiting their job opportunities. 

This project aims to co-design with blind and low-vision volunteers an open-source tool that enables independent work, supports career growth, and creates more inclusive development environments.

To learn more about the research and the previous study we did to come up with the concept, see the project wiki: [SenseUI Wiki](https://github.com/reginacas/sense-ui/wiki)

---

## License

SenseUI is licensed under the MIT License. 

---

## Contact

Questions? Ideas? Want to chat?

Email: <regina.castroespinosa@student.uni-siegen.de>

Join the mailing list for development updates: 

[SenseUI mailing list](https://www.freelists.org/list/sense-ui)

