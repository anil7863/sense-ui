# Sprint 2 Retrospective

Date: Dec 10 2025

Duration: 2 weeks (Nov 24 - Dec 09 2025)

Testers: @paulGeoghegan, @rayo-alcantar , @alekunkel, @fahimnet2014

---

## Summary

During this sprint we introduced the extraction of the HTML, CSS and screenshot of the active tab, as well as the AI-generation of
visual feedback based on the user input and extracted data.

- Issues found: 9
- Issues fixed: 9
- Active testers: 4
- Screen reader coverage: 4 NVDA testers, no JAWS

---

## What went well?

- Extension opens and the chat input is focused right away, enabling the user to immediately start interacting.
- API key setup works smoothly and the settings page feels minimalistic and clean
- NVDA navigates headings
- The commands /describe and /issues work as expected
- Loading process of the responses is announced by NVDA
- The system undestands and responds appropiately to custom and open-ended questions
- Loading time of responses is acceptable for testers
- A stop button was added, to stop the system from generating a response, and it worked as expected.

## What went not-so-well?

### Non-english responses

When users submitted queries in Spanish, SenseUI's responses showed noticeably degraded quality compared to English interactions.
The system produced less detailed feedback, occasionally hallucinated details not present in the provided HTML/CSS, and missed design issues
that would have been caught in English queries. This likely is because the language models are predominantly trained on English data. This could
impact the tool's usability for speaking developers working in non-English contexts.

### Gemini API issues

Mid-sprint, multiple testers reported "usage limit exceeded" errors when using Gemini API keys, despite having available quota.
While trying to fix this, I found that Google had deprecated support for gemini-2.0-flash, the model specified in Sprint 2's configuration.
This was causing the API to reject requests. A quick fix was implemented by updating the model to gemini-flash-latest, which automatically resolves to the current stable Flash model.
Future iterations should implement more robust error handling.

### Other issues

All issues fixed during this sprint can be read here: [Issues from Sprint 2](https://github.com/reginacas/sense-ui/milestone/2?closed=1)

## Sprint 3 planning

Sprint 3 will focus on:

- Feedback customization: Changing the feedback detail level and adding context and intructions from the Settings page.

---

## Related Documents

- [GitHub Sprint 2 Issue](https://github.com/reginacas/sense-ui/issues/40)
- [Issues fixed from Sprint 1](https://github.com/reginacas/sense-ui/milestone/1?closed=1)
- [All tracked issues](https://github.com/reginacas/sense-ui/issues)
