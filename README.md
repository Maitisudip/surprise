# Birthday Surprise for Sutapa ✨

An interactive, animated birthday surprise page built with pure HTML, CSS, and JavaScript — ready to host for free on **GitHub Pages**, with built-in notifications so you know when she opens it and interacts with it.

## 1. Set Up Open Tracking (Takes 30 Seconds)

Because GitHub Pages hosts static files, pick **one** free notification option in `config.js`:

### Option A: Instant Phone / Browser Alert via `ntfy.sh` (Easiest, No Account Required)
1. Open `config.js`.
2. Set `ntfyTopic` to a unique secret name, for example:
   ```js
   ntfyTopic: "sutapa-bday-9482x",
   ```
3. On your phone (install the free **ntfy** app on iOS/Android) or in your browser, open `https://ntfy.sh/sutapa-bday-9482x` and subscribe.
4. You will get instant event notifications as she goes through everything:
   - `page_opened` — Opened the link
   - `envelope_unwrapped` — Tapped the wax seal
   - `section_cake_viewed` & `candles_blown` — Reached the cake & blew out all candles
   - `section_cards_viewed`, `card_flipped_<n>`, & `all_cards_flipped` — Saw and flipped each card
   - `section_letter_viewed` & `letter_read` — Reached and spent 5+ seconds reading the letter
   - `saw_all_sections` — Scrolled through and saw every section
   - `reaction_selected` — Tapped a reaction button
   - `visit_summary` — Sent when she closes or switches away, showing total time spent and a checklist of everything she saw

### Option B: Email Alert via Web3Forms
1. Get a free access key at [web3forms.com](https://web3forms.com).
2. Paste it into `web3formsAccessKey` in `config.js`.

### Option C: Discord / Custom Webhook
1. Paste your webhook URL into `webhookUrl` in `config.js`.

### Option D: Google Analytics 4 (Realtime & Events Dashboard)
1. Create a free GA4 property and copy your Measurement ID (`G-XXXXXXXXXX`).
2. Paste it into `gaMeasurementId` in `config.js` to see all named events in GA4 Realtime.

---

## 2. Customize Your Name (Optional)

In `config.js`, set `senderName` to your name:
```js
senderName: "Your Name",
```
You can also edit `cards` or `letterParagraphs` in `config.js` if you want to tweak any line.

---

## 3. Host on GitHub Pages (Free)

1. Create a new **Public** repository on GitHub (e.g., `happy-birthday-sutapa`).
2. Upload all files from this folder (`index.html`, `styles.css`, `config.js`, `app.js`) — or push with `git`:
   ```bash
   git init
   git add .
   git commit -m "Birthday surprise for Sutapa"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/happy-birthday-sutapa.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **Deploy from a branch**, pick `main` / `/ (root)`, and click **Save**.
5. Wait ~1 minute — your live link will appear at:
   `https://YOUR-USERNAME.github.io/happy-birthday-sutapa/`

---

## 4. Test Safely Before Sending Her the Link

Add `?preview=1` to the end of your URL when testing:
```
https://YOUR-USERNAME.github.io/happy-birthday-sutapa/?preview=1
```
Preview mode disables notifications so your own tests don't trigger false alerts. When you send her the link, send the clean URL **without** `?preview=1`.

