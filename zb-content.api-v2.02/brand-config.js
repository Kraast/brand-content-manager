const BRANDS = {
  zerobubble: {
    id: "zerobubble",
    key: "zerobubble",
    name: "ZeroBubble",
    navName: "ZeroBubble",
    dashboardName: "ZeroBubble",
    primary: "#F47F20",
    secondary: "#4BAFE8",
    background: "#1E1E1E",
    surface: "#252525",
    text: "#F5F5F5",
    focus: "POS systems, retail technology, integrations, support",
    positioning: "A full-stack retail technology partner for Malta SMBs, connecting POS, inventory, ecommerce, payments, and support in one practical setup.",
    keywords: [
      "ExtendaGo",
      "cloud POS",
      "inventory",
      "retail tech",
      "online and instore",
      "ZeroBubble",
      "Malta SMB",
      "retail operations",
      "hospitality POS"
    ],
    competitors: "local POS resellers, traditional cash register suppliers in Malta",
    auditDescription: "ZeroBubble is a Malta-based retail technology company selling cloud POS systems to SMB retail and hospitality clients across Malta. The company targets retailers, restaurants, cafes, and hospitality businesses. Brand colours: #F47F20 orange, #1E1E1E charcoal. Tone: modern, tech-forward, approachable.",
    voice: [
      "Clear",
      "Reliable",
      "Driven"
    ],
    imagePromptPrefix: "Photorealistic Malta retail or hospitality marketing image for ZeroBubble.",
    imageStyleNotes: "Brand colours: dark charcoal background, orange #F47F20 accents, clean white ZeroBubble branding, practical operational feel."
  },
  smartone: {
    id: "smartone",
    key: "smartone",
    name: "SmartOne",
    navName: "SmartOne",
    dashboardName: "SmartOne",
    primary: "#5A17B4",
    secondary: "#000000",
    background: "#000000",
    surface: "#171019",
    text: "#F5F5F5",
    focus: "VAT-approved fiscal cash register with integrated card payments",
    positioning: "Malta's only VAT-approved cash register with integrated card payments, one device, one team to call, zero complexity.",
    keywords: [
      "VAT-approved",
      "fiscal cash register",
      "card payments",
      "one device",
      "Malta compliance",
      "local support",
      "SmartOne",
      "pure black",
      "purple fintech"
    ],
    competitors: "Viva Wallet, traditional card terminals, banks offering payment solutions in Malta",
    auditDescription: "SmartOne is a VAT-approved fiscal cash register with integrated card payments, unique in the Maltese market. Sold by ZeroBubble Ltd. Targets SMB merchants across all retail verticals in Malta. Brand colours: pure black #000000 + purple #5A17B4. Tone: slick, fintech-forward, confidence-inspiring.",
    voice: [
      "Clear",
      "Reliable",
      "Driven"
    ],
    imagePromptPrefix: "Photorealistic SmartOne marketing image in a real Maltese business setting.",
    imageStyleNotes: "Pure black #000000 and vivid purple #5A17B4 palette, product-first, fintech confidence, payment speed and compliance."
  }
};

const CONTENT = {
  zerobubble: {
    brandKit: {
      heroTitle: "ZeroBubble Marketing Kit",
      heroSubtitle: "Retail tech positioning, content calendar, Meta ads, and audit-first nurture sequence.",
      framework: {
        audience: "Retailers and hospitality operators who need connected POS, inventory, ecommerce, integrations, and support.",
        promise: "One practical retail technology partner for the full operating stack.",
        angle: "Operational clarity, stock control, omnichannel selling, reporting, and local service.",
        visualSystem: "Charcoal, white, and ZeroBubble orange with real Malta retail environments."
      },
      positioning: "A full-stack retail technology partner for Malta SMBs, connecting POS, inventory, ecommerce, payments, and support in one practical setup.",
      story: "Malta's retail businesses deserve tech that just works. We built ZeroBubble to give SMB owners a single, trusted partner for POS, payments, and operations, without the enterprise price tag or the runaround. Simple systems. Reliable service. Real results. That's the ZeroBubble promise.",
      doList: [
        "Speak to the business owner, not their IT person",
        "Use numbers and practical outcomes",
        "Show real Maltese retail and hospitality scenarios",
        "Lead with friction, then show the cleaner setup",
        "End every post with a soft next step"
      ],
      dontList: [
        "Use tech jargon without business context",
        "List features without operational value",
        "Talk like a software vendor instead of a retail partner",
        "Use generic stock imagery",
        "Post without tying back to a clear business problem"
      ]
    },
    contentPillars: [
      {
        id: "p1",
        label: "Simplify to Grow",
        desc: "Technology should make your business run faster, not add complexity."
      },
      {
        id: "p2",
        label: "Built for Malta's Retail Reality",
        desc: "Local support, practical setups, and workflows sized for real Maltese businesses."
      },
      {
        id: "p3",
        label: "One Partner, Full Stack",
        desc: "POS, payments, reporting, integrations, and support without juggling vendors."
      }
    ],
    calendar: [
      {
        title: "Week 1 — Establish Authority",
        posts: [
          { platform: "Facebook", type: "Carousel", title: "5 Signs Your POS Setup Is Slowing Down Your Business", hook: "If end-of-day still means checking one system against another, your setup is costing you time.", body: "Five-slide carousel. Each slide shows one operational leak: checkout speed, stock errors, missing reports, manual reconciliation, disconnected ecommerce.", pillar: "p1" },
          { platform: "Instagram", type: "Reel", title: "What a Connected Retail Stack Looks Like", hook: "POS, stock, payments, and reports should talk to each other.", body: "15-second walkthrough of a modern store workflow from sale to reporting.", pillar: "p3" },
          { platform: "LinkedIn", type: "Thought Leadership", title: "Why Malta SMBs Still Run Retail on Disconnected Tools", hook: "Many stores are still managing one business through three systems.", body: "Data-driven post about fragmentation and the hidden cost of manual workarounds.", pillar: "p2" },
          { platform: "Facebook", type: "Static Image", title: "Retail Audit Offer", hook: "Not sure what needs fixing first? Start with clarity.", body: "Promote the free audit with a clean CTA and clear explanation of what the session covers.", pillar: "p1" },
          { platform: "Email", type: "Newsletter", title: "Subject: Where your retail setup leaks time", hook: "The problem is rarely one big failure. It's 20 small delays every day.", body: "Problem-led email that introduces the retail audit as the next step.", pillar: "p1" }
        ]
      },
      {
        title: "Week 2 — Build Trust & Education",
        posts: [
          { platform: "Instagram", type: "Story", title: "What should your POS actually connect to?", hook: "Stock, payments, ecommerce, reporting, and support all matter.", body: "Short story sequence with polls and one simple architecture visual.", pillar: "p3" },
          { platform: "Facebook", type: "Video", title: "How a Better POS Workflow Reduces End-of-Day Stress", hook: "The best setup saves time long after the customer walks away.", body: "Show reporting, stock updates, and payment reconciliation in one flow.", pillar: "p2" },
          { platform: "LinkedIn", type: "List Post", title: "3 Questions Before You Upgrade Your POS", hook: "Start with workflow, not hardware.", body: "Advice-led post from an operator perspective, not a sales pitch.", pillar: "p1" },
          { platform: "Instagram", type: "Quote Graphic", title: "Merchant Testimonial", hook: "\"We finally stopped stitching reports together by hand.\"", body: "Use a local retail quote with sector and location.", pillar: "p2" },
          { platform: "Email", type: "Newsletter", title: "Subject: The hidden cost of disconnected retail systems", hook: "Every workaround has a cost, even if it feels normal now.", body: "Education-first email with invitation to book an audit.", pillar: "p2" }
        ]
      },
      {
        title: "Week 3 — Lead Generation Focus",
        posts: [
          { platform: "Facebook", type: "Lead Magnet", title: "Free Retail Tech Audit", hook: "We will review your setup with no obligation and no hard sell.", body: "Clear offer with form or DM CTA.", pillar: "p1" },
          { platform: "Instagram", type: "Before / After Reel", title: "Disconnected vs Connected Retail Ops", hook: "One version creates admin. The other creates breathing room.", body: "Split-screen reel showing fragmented workflow against connected workflow.", pillar: "p3" },
          { platform: "LinkedIn", type: "Case Study", title: "How a Malta Business Replaced Three Tools With One Cleaner Setup", hook: "They were selling through multiple channels, but managing them separately.", body: "Mini case study with problem, fix, and result.", pillar: "p3" },
          { platform: "Facebook", type: "Poll", title: "What is your biggest retail ops headache?", hook: "Slow checkout, stock errors, weak reporting, or disconnected online sales?", body: "Short engagement post that doubles as discovery.", pillar: "p1" },
          { platform: "Email", type: "Newsletter", title: "Subject: What store owners tell us before they ask for help", hook: "Most businesses wait until the friction feels normal.", body: "Nurture email that normalises the audit step.", pillar: "p2" }
        ]
      },
      {
        title: "Week 4 — Convert & Close",
        posts: [
          { platform: "Instagram", type: "Static Image", title: "ZeroBubble Feature Spotlight", hook: "POS, stock, ecommerce, reporting, and support should feel like one system.", body: "Feature post anchored in business value rather than specs.", pillar: "p3" },
          { platform: "Facebook", type: "Video Testimonial", title: "Best upgrade we made this year", hook: "The right setup shows up in calmer operations.", body: "Short testimonial or founder recap with strong local credibility.", pillar: "p2" },
          { platform: "LinkedIn", type: "Direct CTA", title: "Still planning the upgrade?", hook: "The cleanest next step is understanding your current setup properly.", body: "Direct CTA post to book the audit.", pillar: "p1" },
          { platform: "Instagram", type: "Carousel", title: "Top 5 Questions We Get About POS Upgrades", hook: "These are the questions operators ask before changing anything.", body: "Q and A format with one answer per slide.", pillar: "p3" },
          { platform: "Email", type: "Newsletter", title: "Subject: If you're still thinking about the upgrade", hook: "No pressure. The first win is clarity.", body: "Objection-handling email with a gentle booking CTA.", pillar: "p1" }
        ]
      }
    ],
    metaAds: [
      {
        angle: "Operational Pain",
        cta: "Book a Retail Tech Audit",
        format: "Carousel",
        audience: "Retail and hospitality owners",
        copy: "Your till, stock, ecommerce, and reports should not feel like four separate businesses.\n\nIf end-of-day still means checking one system against another, your tech is slowing you down.\n\nZeroBubble helps Malta retailers connect POS, inventory, online selling, payments, and support into one practical setup.\n\nOne partner. Clear reporting. Less manual work.\n\nBook a free retail tech audit and see what can be simplified first."
      },
      {
        angle: "Growth Stack",
        cta: "Start With an Audit",
        format: "Short video or static",
        audience: "Growing SMBs",
        copy: "Ready to sell instore and online without double work?\n\nZeroBubble gives Malta SMBs a connected POS foundation built around real retail workflows: stock, sales, customers, reporting, ecommerce, and local support.\n\nBuilt around your business type.\nInstalled by people you can call.\nSized for the way Malta businesses actually run.\n\nStart with a 20-minute audit. We will map the cleanest setup for your store."
      },
      {
        angle: "Local Support",
        cta: "Talk to ZeroBubble",
        format: "Founder-led post",
        audience: "Existing system switchers",
        copy: "When checkout stops, you need a local answer.\n\nZeroBubble supports Malta businesses with POS systems, payments, setup, training, integrations, and the practical help that keeps the shop moving.\n\nNo mystery ticket queue.\nNo disappearing vendor.\nNo system that only makes sense to the sales rep.\n\nTalk to a local retail tech team before your next upgrade."
      }
    ],
    emailSequences: [
      {
        day: "Immediate (Day 0)",
        subject: "Your ZeroBubble retail tech audit — what happens next",
        body: "Hi [First Name],\n\nThanks for reaching out. We will look at how your current POS, stock, payments, ecommerce, and reporting setup fits together.\n\nOne of our team will contact you within 24 hours to schedule a 20-minute audit. The goal is simple: find the first places where your setup can save time, reduce errors, or give you clearer numbers.\n\nIn the meantime, send us anything useful: current POS, number of locations, stock pain points, ecommerce needs, or integrations you rely on.\n\nChris and the ZeroBubble team",
        cta: "Prepare for the Audit"
      },
      {
        day: "Day 2",
        subject: "The hidden cost of disconnected retail systems",
        body: "Hi [First Name],\n\nMost retail tech problems do not look dramatic. They look like 20 minutes checking stock manually, sales reports that arrive too late, and a checkout process that needs workarounds.\n\nZeroBubble helps connect the operating pieces: POS, inventory, ecommerce, payments, reporting, and support.\n\nThe audit will show what to fix first, what can wait, and what your cleanest setup could look like.",
        cta: "Book Your Audit Slot"
      },
      {
        day: "Day 5",
        subject: "A better POS setup starts with your workflow",
        body: "Hi [First Name],\n\nA good POS system should fit the way your business sells, stocks, serves, and reports. A boutique, cafe, pharmacy, and multi-location retailer do not need the same workflow.\n\nThat is why we start with the business shape first, then recommend the setup.\n\nBring your current pain points. We will map the practical route from where you are to where you need to be.",
        cta: "Map My Setup"
      },
      {
        day: "Day 8",
        subject: "Three questions before you change POS",
        body: "Hi [First Name],\n\nWhat reports do you need every week?\nStart with the decisions you need to make, then work backwards.\n\nWhere does stock accuracy break?\nThe best system is the one your team can keep accurate during real trading hours.\n\nWho supports you after setup?\nLocal support matters when checkout is not optional.",
        cta: "Ask Us Before You Switch"
      },
      {
        day: "Day 12",
        subject: "Still planning the upgrade?",
        body: "Hi [First Name],\n\nIf now is not the moment, no problem. The useful next step is still to understand your current setup and the upgrade path.\n\nWhen you are ready, we can review your POS, stock, payments, ecommerce needs, and support gaps in one practical session.\n\nAll the best,\nChris\nZeroBubble",
        cta: "Book When Ready"
      }
    ]
  },
  smartone: {
    brandKit: {
      heroTitle: "SmartOne Marketing Kit",
      heroSubtitle: "Fiscal cash register positioning, ad copy, payment-first content, and demo nurture sequence.",
      framework: {
        audience: "Merchants who need a VAT-approved cash register with card payments built in.",
        promise: "One compliant checkout device with one local team to call.",
        angle: "Payment speed, fiscal receipts, compliance confidence, and simple setup.",
        visualSystem: "Pure black, vivid purple, clean fintech confidence, product-first imagery."
      },
      positioning: "Malta's only VAT-approved cash register with integrated card payments, one device, one team to call, zero complexity.",
      story: "Malta merchants should not have to choose between compliance and convenience. SmartOne gives businesses one device for fiscal receipts and card payments, backed by a local team that picks up the phone. Faster checkout. Cleaner operations. Less stress around compliance.",
      visualRule: "SmartOne should look pure black and purple, slick, confident, product-first, and separate from ZeroBubble orange.",
      doList: [
        "Speak to merchants in plain language",
        "Lead with checkout speed and compliance confidence",
        "Show the device in real Maltese business settings",
        "Use product-focused imagery with black and purple branding",
        "Close with a demo CTA"
      ],
      dontList: [
        "Make it sound like general POS software",
        "Mix SmartOne visual language with ZeroBubble orange",
        "Use abstract fintech copy without retail context",
        "Talk about compliance in vague terms",
        "Hide the product in wide lifestyle shots"
      ]
    },
    contentPillars: [
      {
        id: "p1",
        label: "Simplify Checkout",
        desc: "One device, one flow, less friction at the till."
      },
      {
        id: "p2",
        label: "Compliance Confidence",
        desc: "VAT-approved fiscal receipts with less manual stress."
      },
      {
        id: "p3",
        label: "One Device, One Partner",
        desc: "Integrated card payments and local support in one solution."
      }
    ],
    calendar: [
      {
        title: "Week 1 — Establish Authority",
        posts: [
          { platform: "Facebook", type: "Carousel", title: "5 Signs Your Cash Register Is Holding You Back", hook: "If checkout still feels slower than the customer expects, there is a cost to that.", body: "Five-slide carousel focused on speed, hardware sprawl, and manual compliance stress.", pillar: "p1" },
          { platform: "Instagram", type: "Reel", title: "A Day in the Life of SmartOne", hook: "One device. Card payments. Fiscal receipts. Faster checkout.", body: "Short product demo reel in a real retail setting.", pillar: "p3" },
          { platform: "LinkedIn", type: "Thought Leadership", title: "Why Malta Merchants Still Use Separate Devices at Checkout", hook: "Too many businesses still patch the payment moment together.", body: "Founder-led perspective on fragmented checkout and local merchant reality.", pillar: "p2" },
          { platform: "Facebook", type: "Static Image", title: "Merchant Spotlight", hook: "This is what cleaner checkout looks like.", body: "Product-in-use visual with three concrete merchant wins.", pillar: "p2" },
          { platform: "Email", type: "Newsletter", title: "Subject: Is your checkout losing you customers?", hook: "Every extra second at the till changes the feel of the sale.", body: "Problem-led email that invites the merchant to book a demo.", pillar: "p1" }
        ]
      },
      {
        title: "Week 2 — Build Trust & Education",
        posts: [
          { platform: "Instagram", type: "Story", title: "Do you really need a separate card machine?", hook: "Not every checkout should need extra hardware.", body: "Story sequence with poll and simple explanation of integrated flow.", pillar: "p3" },
          { platform: "Facebook", type: "Video", title: "How SmartOne Handles VAT Compliance Automatically", hook: "No more manual VAT receipt stress.", body: "Walkthrough of a transaction generating a compliant fiscal receipt.", pillar: "p2" },
          { platform: "LinkedIn", type: "List Post", title: "3 Questions Before You Replace Your Current Register", hook: "Start with merchant workflow, then technology.", body: "Advice-led post with honest buying guidance.", pillar: "p1" },
          { platform: "Instagram", type: "Quote Graphic", title: "Merchant Testimonial", hook: "\"We finally stopped juggling devices at checkout.\"", body: "Quote-led creative with local sector and location.", pillar: "p2" },
          { platform: "Email", type: "Newsletter", title: "Subject: The VAT question every Malta retailer gets wrong", hook: "If your setup is not approved, the stress does not stay small.", body: "Education-first compliance email with a soft demo CTA.", pillar: "p2" }
        ]
      },
      {
        title: "Week 3 — Lead Generation Focus",
        posts: [
          { platform: "Facebook", type: "Lead Magnet", title: "Book a SmartOne Demo", hook: "We will show you the checkout flow in 20 minutes.", body: "Simple lead-gen post for demo bookings.", pillar: "p1" },
          { platform: "Instagram", type: "Before / After Reel", title: "Before SmartOne vs After SmartOne", hook: "One setup feels dated. The other feels ready.", body: "Split-screen checkout comparison with fast pacing.", pillar: "p3" },
          { platform: "LinkedIn", type: "Case Study", title: "How a Malta Merchant Went From Three Devices to One", hook: "The change was operational before it was technical.", body: "Mini case study about speed, receipts, and merchant confidence.", pillar: "p3" },
          { platform: "Facebook", type: "Poll", title: "What is your biggest checkout pain point?", hook: "Speed, card payments, receipts, or compliance?", body: "Engagement post that doubles as lead discovery.", pillar: "p1" },
          { platform: "Email", type: "Newsletter", title: "Subject: What merchants tell us before they switch", hook: "Most businesses know the checkout is clunky before they change it.", body: "Nurture email that leads toward demo booking.", pillar: "p2" }
        ]
      },
      {
        title: "Week 4 — Convert & Close",
        posts: [
          { platform: "Instagram", type: "Static Image", title: "SmartOne Feature Spotlight", hook: "Card payments and fiscal receipts from one device.", body: "Product-focused creative with three merchant-relevant benefits.", pillar: "p3" },
          { platform: "Facebook", type: "Video Testimonial", title: "Best switch we made this year", hook: "The right device changes the feel of checkout.", body: "Short testimonial or founder recap with strong CTA.", pillar: "p2" },
          { platform: "LinkedIn", type: "Direct CTA", title: "Still thinking about the switch?", hook: "The cleanest next step is a live demo.", body: "Direct CTA post for merchants still deciding.", pillar: "p1" },
          { platform: "Instagram", type: "Carousel", title: "Top 5 Questions We Get About SmartOne", hook: "These are the honest answers we give every week.", body: "Question and answer carousel ending with a demo CTA.", pillar: "p3" },
          { platform: "Email", type: "Newsletter", title: "Subject: Still thinking about it? Here is what you get", hook: "A lot of merchants know they need the change before they are ready to book.", body: "Objection-handling email with low-pressure demo CTA.", pillar: "p1" }
        ]
      }
    ],
    metaAds: [
      {
        angle: "Pain Point",
        cta: "Book a Free Demo",
        format: "Single image or short video",
        audience: "SMB retail owners Malta",
        copy: "Still running a cash register from 2010?\n\nYour customers are tapping their cards. Your register is not ready.\n\nEvery time you ask someone to go to the ATM or fumble with a separate card terminal, you are risking the sale and the next one.\n\nSmartOne is a VAT-approved digital cash register with card payments built in.\n\nOne device. No extra hardware.\nFully compliant fiscal receipts automatically.\nSetup in under a day.\n\nMalta's retailers are upgrading. Here is yours."
      },
      {
        angle: "Transformation",
        cta: "See How It Works",
        format: "Carousel",
        audience: "Retail and hospitality owners",
        copy: "What if checkout took 10 seconds every time?\n\nNo more end-of-day VAT stress.\nNo more separate card machine.\nNo more chasing receipts.\n\nSmartOne gives Malta's retail businesses one clean device that handles it all, cash register, card payments, and fiscal receipts in one.\n\nSee how it works in a free 20-minute demo."
      },
      {
        angle: "Social Proof",
        cta: "Book Your Free Demo",
        format: "Video testimonial or quote graphic",
        audience: "Lookalike of existing customers",
        copy: "\"Best decision we made for the business this year.\"\n\nDozens of Malta retailers have replaced their old cash register and card terminal setup with SmartOne.\n\nOne VAT-approved device. Integrated card payments. Local support when you need it.\n\nBook your free demo today. Setup is faster than you think."
      }
    ],
    emailSequences: [
      {
        day: "Immediate (Day 0)",
        subject: "Your SmartOne demo request — here is what happens next",
        body: "Hi [First Name],\n\nThanks for reaching out. You have just taken the first step toward a simpler, fully compliant checkout setup for your business.\n\nOne of our team will contact you within 24 hours to schedule a 20-minute demo. No sales pressure. We will look at your current setup and show you exactly what SmartOne can do.\n\nAny questions? Reply directly. A real person reads every one.\n\nChris and the ZeroBubble team",
        cta: "Watch the 60-second Overview"
      },
      {
        day: "Day 2",
        subject: "The checkout problem most Malta retailers ignore",
        body: "Hi [First Name],\n\nHow long does a card payment take at your till right now?\n\nIf the answer involves a separate card machine, waiting for a connection, or a receipt that does not match your fiscal register, you are carrying a hidden cost every day.\n\nSmartOne combines your cash register, card terminal, and fiscal receipt printer into one device. VAT-approved. Local support. Ready in under a day.",
        cta: "See It in Action"
      },
      {
        day: "Day 4",
        subject: "A quick story from a Malta shop like yours",
        body: "Hi [First Name],\n\nBefore we worked together, the merchant was running checkout on three separate pieces of equipment. End-of-day reconciliation took 45 minutes. VAT receipts were done manually.\n\nAfter switching to SmartOne, they had one device, automatic VAT receipts, and faster checkout.\n\nWe would love to show you the same for your business.",
        cta: "Schedule 20 Minutes"
      },
      {
        day: "Day 7",
        subject: "Your 3 biggest questions about SmartOne, answered",
        body: "Hi [First Name],\n\nIs SmartOne really VAT approved?\nYes. It is a fully certified fiscal cash register approved by the Maltese tax authority.\n\nHow long does setup take?\nMost businesses are up and running the same day.\n\nWhat if something goes wrong?\nYou call us. Malta-based. Same timezone. Same language.",
        cta: "Book My Free Demo"
      },
      {
        day: "Day 10",
        subject: "Last one from me — the door stays open",
        body: "Hi [First Name],\n\nWhether the timing was not right, you got busy, or you are still weighing options, that is fine.\n\nWhen you are ready, we are here. No pressure.\n\nAll the best,\nChris\nZeroBubble",
        cta: "Book When Ready"
      }
    ]
  }
};

const BRAND_DIRECTION_OVERRIDE_KEY = "brandDirectionOverridesV201";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(baseValue, overrideValue) {
  if (overrideValue === undefined) {
    return deepClone(baseValue);
  }
  if (Array.isArray(baseValue)) {
    return Array.isArray(overrideValue) ? deepClone(overrideValue) : deepClone(baseValue);
  }
  if (isPlainObject(baseValue)) {
    const result = deepClone(baseValue);
    if (!isPlainObject(overrideValue)) {
      return result;
    }
    Object.keys(overrideValue).forEach((key) => {
      if (result[key] === undefined) {
        result[key] = deepClone(overrideValue[key]);
        return;
      }
      result[key] = mergeDeep(result[key], overrideValue[key]);
    });
    return result;
  }
  return overrideValue;
}

function getStoredBrandDirectionOverrides() {
  try {
    const raw = window.localStorage.getItem(BRAND_DIRECTION_OVERRIDE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveBrandDirectionOverrides(overrides) {
  window.localStorage.setItem(BRAND_DIRECTION_OVERRIDE_KEY, JSON.stringify(overrides));
}

function normalizeBrand(value) {
  return value === "smartone" ? "smartone" : "zerobubble";
}

function getSelectedBrand() {
  return normalizeBrand(window.localStorage.getItem("selectedBrand"));
}

function setSelectedBrand(brandId) {
  const normalized = normalizeBrand(brandId);
  window.localStorage.setItem("selectedBrand", normalized);
  return normalized;
}

function getBrand(brandId) {
  const normalized = normalizeBrand(brandId);
  const overrides = getStoredBrandDirectionOverrides();
  return mergeDeep(BRANDS[normalized], overrides[normalized]?.brand);
}

function getBrandContent(brandId) {
  const normalized = normalizeBrand(brandId);
  const overrides = getStoredBrandDirectionOverrides();
  return mergeDeep(CONTENT[normalized], overrides[normalized]?.content);
}

function getBrandDirectionSnapshot(brandId) {
  const normalized = normalizeBrand(brandId);
  return {
    brand: getBrand(normalized),
    content: getBrandContent(normalized)
  };
}

function setBrandDirectionOverride(brandId, overridePayload) {
  const normalized = normalizeBrand(brandId);
  const allOverrides = getStoredBrandDirectionOverrides();
  allOverrides[normalized] = {
    brand: overridePayload?.brand || {},
    content: overridePayload?.content || {}
  };
  saveBrandDirectionOverrides(allOverrides);
  return getBrandDirectionSnapshot(normalized);
}

function clearBrandDirectionOverride(brandId) {
  const normalized = normalizeBrand(brandId);
  const allOverrides = getStoredBrandDirectionOverrides();
  delete allOverrides[normalized];
  saveBrandDirectionOverrides(allOverrides);
  return getBrandDirectionSnapshot(normalized);
}

window.BRANDS = BRANDS;
window.CONTENT = CONTENT;
window.normalizeBrand = normalizeBrand;
window.getSelectedBrand = getSelectedBrand;
window.setSelectedBrand = setSelectedBrand;
window.getBrand = getBrand;
window.getBrandContent = getBrandContent;
window.getStoredBrandDirectionOverrides = getStoredBrandDirectionOverrides;
window.getBrandDirectionSnapshot = getBrandDirectionSnapshot;
window.setBrandDirectionOverride = setBrandDirectionOverride;
window.clearBrandDirectionOverride = clearBrandDirectionOverride;
