// Milestone switch for voter identity. Flip this as later milestones land:
//   "none"   -> Milestone 1: anyone can vote, no identity captured
//   "email"  -> Milestone 2: voter types any email, one vote per email per event
//   "google" -> Milestone 3: voter signs in with Google, one vote per account per event
export const VOTER_AUTH_MODE: "none" | "email" | "google" = "none";
