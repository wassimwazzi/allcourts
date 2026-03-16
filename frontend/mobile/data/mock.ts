export const discoveryMetrics = [
  { label: "Open tonight", value: "18 slots" },
  { label: "Avg. drive", value: "11 min" },
  { label: "Instant book", value: "92%" }
] as const;

export const venues = [
  {
    id: "harbor-club",
    name: "Harbor Club",
    area: "Downtown • Indoor hard courts",
    trustNote: "Host replies in under 5 min",
    rate: "$34",
    availability: "Best at 7:30 PM",
    tags: ["Free parking", "Locker rooms", "Pro lighting"],
    confidence: "Free cancellation up to 2 hours before start.",
    address: "12 Harbor Street",
    checkIn: "Code sent 15 minutes before play",
    surface: "Indoor hard",
    players: "Singles or doubles",
    nextSlot: "Tonight, 7:30 PM - 8:30 PM"
  },
  {
    id: "riverside-tennis",
    name: "Riverside Tennis Center",
    area: "West Loop • Covered clay courts",
    trustNote: "Top-rated cleanliness this week",
    rate: "$28",
    availability: "2 slots after work",
    tags: ["Clay", "Showers", "Equipment rental"],
    confidence: "Verified venue staff and live occupancy updates.",
    address: "88 River Lane",
    checkIn: "Front desk welcome with QR check-in",
    surface: "Covered clay",
    players: "Singles preferred",
    nextSlot: "Today, 6:45 PM - 7:45 PM"
  },
  {
    id: "midtown-padel",
    name: "Midtown Padel House",
    area: "Midtown • Glass-backed doubles courts",
    trustNote: "Friendly hosts and repeat-booker favorite",
    rate: "$42",
    availability: "Prime 8:15 PM opening",
    tags: ["Padel", "Cafe", "Beginner clinics"],
    confidence: "Rain-safe booking with indoor backup court.",
    address: "205 Madison Ave",
    checkIn: "Tap to unlock after booking confirmation",
    surface: "Padel glass court",
    players: "Doubles only",
    nextSlot: "Tonight, 8:15 PM - 9:15 PM"
  }
] as const;

export const reservations = {
  upcoming: [
    {
      id: "res-203",
      venue: "Harbor Club",
      date: "Tue, Oct 8",
      time: "7:30 PM - 8:30 PM",
      status: "Ready to play",
      confidence: "Guest code unlocks at 7:15 PM",
      teammate: "Ari confirmed"
    },
    {
      id: "res-198",
      venue: "Riverside Tennis Center",
      date: "Sat, Oct 12",
      time: "10:00 AM - 11:30 AM",
      status: "Pending teammates",
      confidence: "Free reschedule until Friday 6 PM",
      teammate: "2 spots still open"
    }
  ],
  past: [
    {
      id: "res-190",
      venue: "Midtown Padel House",
      date: "Fri, Sep 27",
      time: "8:00 PM - 9:00 PM",
      status: "Played",
      confidence: "Rebook in one tap",
      teammate: "Played with Nora + Ben"
    }
  ]
} as const;

export const profileHighlights = [
  {
    label: "Sign-in ready",
    value: "Account, saved payment methods, and player history can slot in without reshaping the routes."
  },
  {
    label: "Notification ready",
    value: "Booking reminders and community activity can land in the same shell later."
  },
  {
    label: "Memberships deferred",
    value: "Foundation stays focused on discovery, booking clarity, and reservations confidence."
  }
] as const;
