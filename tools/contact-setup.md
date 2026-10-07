# Contact setup

The existing email draft stays available. Preparing or editing a brief makes no network request. The email link opens a draft in the visitor’s own app; Copy message is the fallback. **Request a Google Meet** lets visitors suggest a future date and time from 5 pm onwards in India time, then review an email to `ayushhhudd@gmail.com`. Ayush confirms availability and shares the Meet link by email. This is a request, not a reservation. Opening the call panel preserves any project brief already written.

The time is chosen through separate Hour and Minute dropdowns, avoiding inconsistent native AM/PM time-field states in Safari. Both choices are required; the page constructs an explicit 24-hour IST value before validating it. All minutes00–59 are available.

`contact-config.js` contains three public destinations, all empty initially. Empty or invalid destinations do not create a Formspree send option or WhatsApp link. A valid booking URL replaces the call-email link with **Book a Google Meet**. Never put an API key, password, or account token in this file.

## Enable Formspree

1. Sign up at [Formspree](https://formspree.io/), verify `ayushhhudd@gmail.com`, and create a form named “Portfolio enquiries”.
2. In the form’s **Integration** section, copy its endpoint. Its shape is `https://formspree.io/f/FORM_ID`.
3. Send that endpoint to Codex, or put it into `formspreeEndpoint` in `contact-config.js`. An endpoint is a public form destination; no API key is needed on this site.
4. In Formspree, check the recipient is Ayush’s address. Review spam settings and, if enabled for this form, the allowed production origin `https://algorhythmicss.github.io`.
5. Deploy, then submit one deliberate test using an address you control. Confirm both the Formspree dashboard entry and the email received in Ayush’s inbox; verify replying reaches the test sender. No such live delivery test has been performed yet.

When enabled, the visitor still reviews the editable draft first. **Send enquiry** asks for their reply email and sends that reviewed message to Formspree. The email-app and copy options remain. A successful HTTP response is described as Formspree accepting the enquiry, not proof that Ayush’s mail provider delivered it. Requests time out after 20 seconds; an interrupted or unconfirmed request is not automatically retried because it may already have reached Formspree. The visitor can explicitly try again or use the preserved email draft.

The page explains Formspree’s processing beside the send control. The initial draft and copy flow does not transmit its details to a form provider. No enquiry is persisted in browser storage by the site.

Formspree’s [HTML setup documentation](https://help.formspree.io/articles/building-your-form/building-an-html-form/) explains account verification and the endpoint. Its [JavaScript documentation](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax) recommends a helper library; this buildless page uses a small custom handler so it can keep the current reviewed draft and email fallback.

## WhatsApp

Put the intended public business number into `whatsappNumber`, including its country code. The code accepts 8–15 digits and normalizes spaces, parentheses, hyphens, or a leading plus. A valid number exposes a `wa.me` link with a short project greeting. Opening the link does not send a message; the visitor sends it in WhatsApp. Publishing the number makes it public. Leave it empty if you do not want it shared.

Ayush now wants visitors to message without exposing his phone number. Keep this value empty. The existing website enquiry + Formspree route needs only a reply email and message; it does not require his number. Until a verified endpoint is provided, visitors can review and open an email draft. Do not label that as an on-page message already sent.

For an optional messenger, use a real [Telegram username link](https://telegram.org/faq#q-how-does-t-me-work) with Phone Number visibility set to Nobody, or a [Signal username link](https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames) with the relevant phone-number privacy settings. Neither username nor link has been supplied. Do not invent a handle or replace it with a phone-number link.

## Google Meet appointments

Sign in to **Google Calendar as `ayushhhudd@gmail.com` → Create → Appointment schedule** on a computer. Set the time zone to **Asia/Kolkata (IST)** and begin availability at **5 pm**. Choose the actual available days, closing time, call length, buffers and notice period; those details remain awaiting Ayush’s choice. Set **Location and conferencing → Google Meet**, save, and copy the public booking-page link. Send that URL to Codex or put it into `bookingUrl`. Keep the separate email link for requests before 5 pm.

The config accepts public `calendar.app.google/...` links and `calendar.google.com/calendar/appointments/schedules/...` links (including Google’s optional `/u/NUMBER/` path). A plain `meet.google.com` room link is not an appointment schedule and does not enable booking. Test the page signed out to verify the slots, identity, confirmation email and Meet link. Features and account eligibility vary; check the options in the account before promising them.

Google’s [appointment-schedule instructions](https://support.google.com/calendar/answer/10729749) cover these settings. Until this is configured, the portfolio’s call panel prepares a request email. It does not read availability, create a Calendar event, send a Meet invite, or confirm a slot. The connected Calendar profile was verified as Ayush’s Gmail on 7 October 2026; the browser reached Google sign-in for a different account, so no appointment schedule was created.

## Google Forms alternative

A separate published Google Form is possible, but would move the visitor out of this review-and-send flow. Choose it only if you prefer a separate brief questionnaire; share its published responder URL, not its editor URL. No Google Form or owner account has been created by this change.

## Verification boundary

Local stub checks cover endpoint validation, no network request on draft creation, acceptance, HTTP rejection, rate limiting, server/network/timeout uncertainty, duplicate prevention while busy, and editable preserved drafts. Real Formspree receipt, inbox delivery, a WhatsApp destination, and an appointment schedule require the owner’s values and a deliberate live test.
