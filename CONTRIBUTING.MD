# Contributing to SenseUI

## Project Values

- **Community-driven**: Development decisions emerge from continuous collaboration with BVI developers
- **Accessibility-first**: All features must meet WCAG AAA standards
- **Transparency**: Development happens in the open, with clear documentation

## Ways to Contribute

### As a Tester

Testers evaluate each sprint's deliverables and provide crucial feedback on accessibility and usability.
At the start of each testing phase, a tracking issue will be created (labeled "current-sprint") with:
- What features are in this sprint
- What to look for when testing. 

After I create this issue, you will get tagged and then you can:
- Test the tool for as much as you can (I would say at least 30 minutes)
- Comment on what works, what breaks, suggest improvements, etc.
- Assess screen reader compatibility and keyboard navigation
- Report bugs and feedback through the issue's comments
- Add criticality to the bugs:
  - Critical: blocks major functionality or accessibility; must be fixed before next release
  - High: Significant issue affecting a key features
  - Medium: Noticeable issue but not a blocker; can be scheduled for later
  - Low: Minor issue, fix when convenient
  - Enhancement – Not a bug, but a suggested improvement

**Flexibility:**
- Skip any sprint if your schedule doesn't allow it, just let me know 
- Withdraw at any time, you'll keep access to the mailing list and public repository

### As a Developer

Developers go beyond testing to directly implement fixes and features.

**Responsibilities:**
- All tester responsibilities (above)
- Create feature branches and submit pull requests
- Address identified issues through code contributions
- Participate in sprint planning discussions
- For more details send me a message

## Development Process

SenseUI follows an iterative sprint-based development approach:

1. Planning: I'll propose features and accessibility issues on the mailing list, and the 
community can help prioritize or suggest changes.
2. Development: Me and other volunteer developers build features according to the backlog
3. Testing: Testers evaluate functionality and accessibility
4. Retrospective: Reflect on the process and gather feedback (every 2 sprints)
5. Release: Publish a new version

Each sprint lasts 2 to 3 weeks, running until end of January/early February 2026.

## How to Get Started

### Prerequisites

- Experience with web development and GitHub
- Use a screen reader (NVDA, JAWS, or VoiceOver) for coding
- Professional or educational experience in web development

### Setup

1. Clone the repository
2. Install dependencies (see README.md)
3. Load the extension in Chrome for testing
4. Join the mailing list for updates

## Reporting Issues

When reporting bugs or accessibility issues, please include:

- Screen reader and version (e.g., NVDA 2024.1)
- Browser and version (e.g., Chrome 120)
- Steps to reproduce the issue
- Expected behavior vs. actual behavior

Use GitHub Issues with the appropriate labels:
- `bug` - Something isn't working
- `accessibility` - Screen reader or keyboard navigation issues
- `enhancement` - Feature requests or improvements
- `documentation` - Documentation needs

## Pull Request Guidelines

1. Create a feature branch from `main`
2. Follow accessibility standards: All code must be WCAG AAA compliant
3. Write semantic HTML with proper ARIA labels
5. Document your changes in the PR description
6. Reference related issues (e.g., "Fixes #42")

### Code Standards

- Use semantic HTML elements
- Include proper ARIA labels and roles
- Ensure full keyboard navigation support

## Communication Channels

- GitHub Issues: Bug reports, feature requests, and technical discussions
- Mailing list: Sprint updates, retrospective scheduling, and announcements
- Retrospective calls: Bi-sprint reflection sessions (optional)

### Sprint Retrospectives

Every 2 sprints, we hold retrospective calls to discuss:
- What worked well in the development process
- What created difficulties or barriers
- What could be improved about collaboration
- Insights on accessibility and usability

These calls focus on the **process** itself, not just product evaluation. Your voice helps shape how we work together.

## Questions?

If you have questions about contributing, please reach out through the mailing list

## License

By contributing to SenseUI, you agree that your contributions will be licensed under the project's open-source license (MIT License).

**Thank you for helping make web development more accessible for blind and low vision developers!**
