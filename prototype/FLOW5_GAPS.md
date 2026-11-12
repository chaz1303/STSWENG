# Flow 5: screen inventory, match tally and gap report

Flow 5 (`flow5.js`, `flow5.css`) rebuilds the Figma file "SOFIA Manong (Copy)", section "Var4: Final (Flow 4)" (node `3312:2662`). Written 2026-11-12 by Fable, pending marn's review.

How it was checked: each screen was captured with Playwright in Brave (confirmed through `navigator.brave`) on the 375 x 812 phone frame and laid next to the Figma export of the same frame. The "diff" column is the share of pixels that differ by more than a small threshold. Font smoothing, the phone's rounded corners and the notch put identical screens at about 2%.

## 1. Screen inventory and match tally

| # | Figma frame (node) | Flow step | State | Prototype screen | Diff | Result |
|---|---|---|---|---|---|---|
| 1 | FIRST PAGE (`14:1100`) | Welcome | default | `a-welcome` | 5% | Pass. Emoji in two pills render in the system emoji font |
| 2 | LOG IN PAGE WITH LOGO (`1:21`) | Log in | empty | `a-login` | 2% | Pass |
| 3 | USING MOBILE WITH CODE (`24:1863`) | Sign up 1 | empty, error | `a-phone` | 4% | Pass |
| 4 | USING MOBILE WITH CODE (`24:2351`) | Sign up 1 | filled | `a-phone` | 4% | Pass |
| 5 | USING MOBILE WITH CODE (`22:144`) | Sign up 2 | 1 digit typed | `a-otp` | 15% | **Differs on purpose.** Figma shows the iOS letter keyboard under a number-only field. The prototype reuses the number pad from the step before. Everything above the keyboard matches |
| 6 | V4 · Home (`3312:2672`) | Home | filled | `a-home` (Flow 4) | 2% | Pass |
| 7 | BOOKING (`3202:746`) | Book 1 | Quick Checkup picked | `a-service` | 10% | Pass within 3px. Tier cards sit 1 to 3px lower |
| 8 | SERVICE DETAILS (`3202:1858`) | Book 2 | filled | `a-details` | 10% | Pass within 13px. Figma shows the example text as if typed ("17 / 300 characters"); the prototype shows it as a placeholder ("0 / 300"). The notes card starts 13px higher |
| 9 | DETAIL CONFIRMATION (`3333:3641`) | Book 3 | top of sheet | `a-confirm` | 5% | Pass |
| 10 | DETAIL CONFIRMATION (`3330:1579`) | Book 3 | sheet scrolled | `a-confirm` | 7% | Pass |
| 11 | DETAIL CONFIRMATION (`3333:2153`) | Book 4, Find Your Manong | first offer | `a-finding` | 10% | Pass, with one data difference: see gap 9 |
| 12 | DETAIL CONFIRMATION (`3333:2577`) | Book 4 | scrolled | `a-finding` | 8% | Pass |
| 13 | LIVE TRACKING (`3333:4007`) | Tracking | on the way | `a-found` | 13% | Close. Map, header and sheet top match. Rows inside the Manong card sit up to 10px off because the sheet is Flow 4's component |
| 14 | ORDER SUMMARY PT1 (`3225:3766`) | Rate | 5 stars | `a-summary` | 16% | **Differs on purpose.** The two buttons are pinned to the bottom in every scroll position (Figma names them "Primary Sticky Bottom Action Section" but only draws them in PT2). No blue check on the avatar |
| 15 | ORDER SUMMARY PT2 (`3333:4637`) | Tip and bill | scrolled | `a-summary` | 13% | Close. Bill rows use the booking's real data, not Figma's sample ("Standard Pipe & Leak Repair, ₱450.00") |
| 16 | RECEIPT (`3312:2700`) | Done | default | `a-thanks` (Flow 4) | 2% | Pass |
| 17 | SCHEDULED SERVICE (`3312:2702`) | Scheduled | pending | `a-pending` (Flow 4) | 2% | Pass |
| 18 | SCHEDULED SERVICE: NOT AVAILABLE (`3312:2705`) | Scheduled | declined | `a-declined` (Flow 4) | 3% | Pass |
| 19 | ORDER SUMMARY ALT (`3333:4635`) | Cancelled | top | `a-cancelled` | 15% | **Differs on purpose.** Footer buttons are pinned (Figma draws them only in the scrolled frame). Avatar is the booked Manong, not Figma's stock photo |
| 20 | ORDER SUMMARY ALT (`3333:4633`) | Cancelled | scrolled | `a-cancelled` | 14% | Pass within 5px |
| 21 | BOOKING HISTORY (`3312:2708`) | Bookings tab | empty | `a-history` (Flow 4) | 2% | Pass |
| 22 | ACCOUNT (`3312:2711`) | Account tab | filled | `a-account` (Flow 4) | 2% | Pass |
| 23 | MESSAGES (`3312:2714`) | Messages tab | filled | `a-messages` (Flow 4) | 2% | Pass |
| 24 | NOTIFICATIONS (`3312:2717`) | Notifications | filled | `a-notifs` (Flow 4) | 2% | Pass |

Tally: 24 frames. 18 pass, 3 are close (frames 13, 15 and 8, spacing only), 3 differ on purpose (frames 5, 14, 19).

Not checked: Safari and real iOS rendering, dark mode (the file has none), and the look of frames 7, 8, 13 and 15 at the level of single pixels. Their sizes come from the design context of one card each, not every node.

Assets exported from Figma are in `assets/f5/` (map, logo, Sofio's photo, 57 icons). Nothing was redrawn.

## 2. Gaps filled

| # | Screen / area | What Figma is missing | What I did | Why (what I based it on) | Confidence | Needs a decision from |
|---|---|---|---|---|---|---|
| 1 | Other services | Only plumbing has a booking path | Cleaning, Locksmith and Movers use the same six screens with their own tier names, prices, durations and symptom chips | Flow 3's catalogue `CAT3` in `full.js` (same data as `mobile/mocks` `CATALOG` and `DURATION`); rosters from `ROSTER3` | High | PO + Team 2 (categories, open item 8) |
| 2 | Sign up | After the 6-digit code Figma goes "back to the Log in page". Nothing collects a name, email or password | Added a "Create account" screen in the OTP screens' style (name, email, password), then Log in with the mobile filled in | U01 spec needs email, mobile, password and full name | Medium | PO (open item 24) |
| 3 | Sign up | No rule for a wrong number, expired code or resend | Number must be 10 digits starting with 9. The code counts down from 120s, Resend restarts it, any 6 digits pass | Figma copy ("Code expires in 120s", "Resend") and Flow 2's phone screens | Medium | PO (open items 17, 24) |
| 4 | Welcome | "Explore services as Guest" leads nowhere | Guest lands on Home and can browse. Tapping a service asks them to log in | Smallest reading of the link text | Medium | PO (open item 27) |
| 5 | Log in | No error states | Inline error under the fields, form shakes. "+63" chip says only PH numbers work for now | Flow 4 login behaviour | High | PO (open item 17) |
| 6 | Log in | Apple button, Forgot password | Apple signs in like Google and Facebook do in the prototype. Forgot password opens the existing reset sheet | Earlier flows | High | Dev (social login is not in U01) |
| 7 | Confirm | The pencil beside WHEN goes nowhere, and nothing lets you choose now or later | Sheet with Now / Schedule and Flow 4's date and time picker. The default is Now | Flow 4 "When do you need Manong?" | High | PO |
| 8 | Confirm | No rule for the price stepper | Offer can't go below the fixed base price, steps of ₱10, chips at base, +₱50 and +₱100. Starts at base + ₱50 as drawn | Figma numbers (base ₱200, offer ₱250, chips 200/250/300) | Low. **Placeholder** | PO, client (open items 6, 23) |
| 9 | Find Your Manong | Frames disagree: offer ₱250, yet Clariso "accepted your offer" at ₱200 in one frame and ₱250 in the other. One frame has a decline button, the other doesn't | First Manong accepts your offer at your price. Second counters ₱25 higher. Decline button always shown | The scrolled frame, which is the later one | Low. **Placeholder** | PO, client (open items 5, 23) |
| 10 | Find Your Manong | Nothing says how offers arrive or what "refresh" does | Offers appear one at a time over about 4 seconds. The timer loops every 30s. Raising the offer notifies Manongs again and brings back declined offers | Figma copy only | Low. **Placeholder** | PO (open item 23) |
| 11 | Find Your Manong | Pencil in "Need faster arrival?" and the Labor Warranty row lead nowhere | Pencil opens a sheet to type your own amount. Warranty opens a short explainer | Figma labels | Medium | PO (open item 29, warranty terms) |
| 12 | Scheduled path | Figma's arrow goes from Confirm straight to Request Sent, but that screen names a Manong nobody chose | Scheduled bookings also go through Find Your Manong. Accepting an offer leads to Request Sent | Request Sent needs a Manong | Medium | PO (open item 5) |
| 13 | Declined | "Find another Manong" and "Pick a new time" targets | Another Manong reopens the offers without the one who declined. New time goes to Confirm with the When sheet open | Flow 4 | High | none |
| 14 | Cancel | Rules for the refund, fee and voucher | Cancelling on Find goes back to Confirm (Figma note). Cancelling on tracking or while pending shows the cancelled summary with a full refund, no fee and the voucher restored. Cash shows "No charge" | Figma frames 19 and 20, U13 (cancel before In Progress) | Medium. **Placeholder** | PO (open items 7, 26) |
| 15 | Cancelled summary | Download link, support link | Download saves a text notice. Support shows the existing "replies within 5 minutes" toast | Flow 4 receipt download | High | none |
| 16 | Order summary | Figma's bill drops the base price, voucher and tip lines | Followed Figma (four rows). An approved extra part still shows as a row, and the total is live | Exact replica came first | Medium | PO (U14, U15: is the short bill enough?) |
| 17 | Statuses | Figma labels versus contract states | Unchanged from Flow 4: Finding = Requested, On the way = Accepted / Confirmed, Arrived = In Progress, Request Sent = Pending Confirmation | Open item 20, `src/utils/contract.js` | High | Analyst + Team 2 (item 20) |
| 18 | Agreed price | Figma never shows where the accepted offer becomes the bill | The accepted offer replaces the tier price for that booking, so tracking, bill, receipt and history agree | Needed for the totals to add up | Medium | PO (open item 23) |

## 3. Possible gaps I did not fill

| Area | Problem | Suggestion |
|---|---|---|
| Brand | The logo says "manong" while the app, copy and documents say "Mang Juan" | Pick one name before the demo script is written (open item 28) |
| Home | Welcome sells aircon and electrical, but Home lists Cleaning, House Repairs, Locksmith and Movers | Add the missing rows or change the welcome cards once categories are final (item 8) |
| Voucher | MANONG50 is applied silently. The booking path has no place to see or remove it, though Account has a Vouchers tile | Add a voucher row to the price card on Confirm |
| Confirm | The main button is at the end of the scroll, so it is off screen when the sheet opens | Pin it like the Order Summary buttons |
| Price offer | "Cheapest Rate" shows even when you offer more than the base | Tie the badge to the offer, or drop it |
| Find Your Manong | No state for "nobody made an offer" | Add an empty state with "raise your offer" and "try a schedule" |
| Contrast | Measured with the WCAG formula. Fine: "High Demand" red on white 6.5:1, welcome paragraph 5.2:1, "Accept" brown #694b00 on #f7b928 4.6:1. Fails AA (4.5:1): the legal line on Welcome #9ca3af on yellow 1.8:1, the orange "always on call." headline 2.2:1 (large text needs 3:1), field placeholders 2.3:1, "Explore services as Guest" and "Trusted by" grey 3.3:1 | Darken the grey text on yellow to #4b5563 (5.2:1) and the orange headline to about #92400e |
| Tap targets | Edit pencils are 32px, the decline button is 48px, the legal links are about 12px tall | Raise pencils and links to 44px |
| Labels | Figma has no labels for icon-only buttons | The prototype adds aria-labels (back, edit time, decline, clear number). Carry them into the real app |
| OTP | "Didn't received any code?" is a grammar slip in the file | "Didn't receive a code?" |
| Details | "to help the aide diagnose" uses "aide" where every other screen says "Manong" | Use "Manong" |
| Mixed durations | Quick Checkup is "~10 mins" on BOOKING and "~15 mins" on Confirm. The contract says 15 minutes | Use 15 everywhere |
| Unverified accounts | What an unverified resident can't do is still open (item 16) | Decide before sign-up ships |
| Errors and offline | No frames for a failed request, a lost connection or a payment that fails | Reuse the toast and inline error styles from Log in |
