# First Retrospective Call

Date: January 24, 2026

Attendees: Regina (Moderator), Anil, Paul

---

## Overview

During this meeting we opened a discussion about the development and testing process of SenseUI, as well as future improvements. Participants evaluated improvements to the "Add Context" feature, the shortcuts settings and the opening and closing behavior of the web extension panel.

---

## What Went Well

### User Experience & Functionality

Anil shared that the UX in SenseUI has helped him understand the structure of websites by creating mental models—enabling him to "see" through imagination rather than requiring sight. 
Anil noted that even government websites, which are often inaccessible with screen readers alone, become understandable through SenseUI's analysis. This shows tool's value not just in webside design but an added bonus of making poorly-designed websites more navigable.

### Development & Contribution Process

Both Anil and Paul found the development process straightforward and rewarding:

- Anil reported that contributing code was easy and straightforward. GitHub as the collaboration platform was intuitive for him.
- Paul appreciated GitHub's usability, particularly the Issues feature for writing testing feedback. He found the ability to quote questions and paste them in comments practical and efficient.
- Paul noted that testing requirements and questions had appropriate detail and length—providing clear guidance without overwhelming participants.

---

## What Went Not So Well

### Panel's closing behavior
Anil identified that SenseUI's panel closes when users switch tabs or windows, requiring them to reopen it. While this doesn't start a new session, the automatic closure can be unexpected. Anil suggested keeping the panel open across tab and window changes unless the user explicitly closes it.
Anil has kindly volunteered to research a solution and try to implement this feature.

### Shortcuts

Users can only customize SenseUI's keyboard shortcut through Chrome's built-in settings. However, Chrome doesn't clearly warn users that custom shortcuts can override Chrome's native shortcuts. This could confuse SenseUI users who try to customize their shortcut. Since we cannot modify Chrome's interface, we will improve user awareness by adding clearer documentation in the Settings page and About page.

### API Key Management

Paul identified a friction point: having to input the API key every time a new build is ready for testing. However, he acknowledged this is likely a temporary issue specific to the development phase. Once SenseUI is published, users will only need to configure their API key once during initial setup.
Recommendation: Document this as a known limitation of the development process. Consider automating API key persistence in test builds or providing clear instructions for reusing credentials across builds.

---

## What Should We Try in Sprint 4

### Add Context Feature Expansion

The team discussed enhancements to the "Add Context" feature, which allows users to provide contextual information to improve AI feedback accuracy. 
We discussed about the importance of [this ticket](https://github.com/reginacas/sense-ui/issues/85), which request that different sets of context/instructions can be used for different projects simultaneously (e.g., Project A and Project B).
We agree this needs to be prioritized for this feature, which will be live on next sprint. 

We also talked about what type of data points could be included in this context, which include:

#### Frameworks & Technologies

Users can specify which frameworks their website uses (e.g., Tailwind, Angular, vainilla HTML, etc). This enables SenseUI to provide framework-specific recommendations and adapt output accordingly.

#### Desired Aesthetic

Users define the visual direction they want (e.g., elegant, professional, minimalist, playful, corporate). 

#### Website Type & Purpose

Users specify the website category (e.g., e-commerce, landing page, personal portfolio, blog, documentation). This allows AI to provide feedback aligned with that category's best practices and conventions.

---

## Announcements

The University of Siegen has approved funding to distribute 10 AI API keys with $5 USD worth of credit each to support participants. 

---

## Next Steps for Sprint 4

- Implement the expanded "Add Context" feature with framework, aesthetic, and website type inputs
- Implement [Ticket 85](https://github.com/reginacas/sense-ui/issues/85) 
- Evaluate how contextualized prompts improve feedback quality and relevance
