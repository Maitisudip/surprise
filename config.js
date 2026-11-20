// ============================================================
//  Customize Sutapa's Birthday Surprise & Visit Notifications
// ============================================================

window.BIRTHDAY_CONFIG = {
  // Name shown on the envelope and letter
  recipientName: "Sutapa",

  // Your name at the bottom of the letter (leave "" for default sign-off)
  senderName: "",

  // ------------------------------------------------------------
  // TRACK WHEN SHE OPENS THE PAGE (Choose any 1 option below)
  // ------------------------------------------------------------

  // OPTION 1 (Recommended — Free, instant push alert, 10 sec setup):
  // 1. Pick a unique secret topic name below (e.g. "sutapa-bday-9482x")
  // 2. Open https://ntfy.sh/YOUR-TOPIC-NAME in your browser or the ntfy phone app
  // 3. Click "Subscribe" — you'll get an instant notification when she opens it!
  ntfyTopic: "",

  // OPTION 2 (Email alert via Web3Forms — Free at https://web3forms.com):
  // Paste your Web3Forms Access Key to receive an email when she visits.
  web3formsAccessKey: "",

  // OPTION 3 (Discord / Slack / Google Apps Script Webhook URL):
  // Paste a Discord webhook URL (or custom JSON webhook) if you prefer alerts there.
  webhookUrl: "",

  // OPTION 4 (Optional Google Analytics 4 Dashboard):
  // Paste your GA4 Measurement ID (e.g. "G-XXXXXXXXXX") to view all events in GA4 Realtime.
  gaMeasurementId: "",

  // Set to true to get step-by-step events as she scrolls through each section
  // (cake, flip cards, letter, saw everything, and time-spent summary).
  trackSectionViews: true,

  // ------------------------------------------------------------
  // CUSTOMIZE TEXT (Optional — already tailored for Sutapa!)
  // ------------------------------------------------------------
  headlineSubtext:
    "No big speeches. Just a tiny corner of the internet made to celebrate you today.",

  cards: [
    {
      badge: "01",
      title: "Your Vibe",
      frontHint: "Tap to flip",
      text: "There is something effortlessly bright about the way you carry yourself. Even an ordinary day feels a little lighter when you're around."
    },
    {
      badge: "02",
      title: "Your Smile",
      frontHint: "Tap to flip",
      text: "Easily one of my favorite things to see. Today is the best excuse for the universe to give you a hundred more reasons for it."
    },
    {
      badge: "03",
      title: "A Tiny Throwback",
      frontHint: "Tap to flip",
      text: "Remember that little webpage I once made to ask you out? Turns out I still enjoy building small things just to see you smile — no catch today, just birthday cheers."
    },
    {
      badge: "04",
      title: "Your Year Ahead",
      frontHint: "Tap to flip",
      text: "Here's to calm mornings, good coffee, loud laughs, and every quiet wish you've been keeping to yourself finding its way to you."
    }
  ],

  letterParagraphs: [
    "Happy Birthday! ✨",
    "I figured your phone is probably buzzing with texts today, so I wanted to make something a little quieter and completely yours for a minute.",
    "Since you once liked the way I put together a little webpage, I thought your birthday deserved an upgraded one of its own. I genuinely admire the person you are — warm, thoughtful, and effortlessly memorable.",
    "No plans or pressure today — I just hope your birthday feels as wonderful as you make the people around you feel, surrounded by everything and everyone you enjoy most.",
    "Keep shining the way you do."
  ],

  defaultSignOff: "Someone who's really glad to know you"
};

