import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // v8 uses `max` (preferred)
  message: { success: false, message: "Too many requests, try after some time" },
  standardHeaders: "draft-8", // enable RateLimit header
  legacyHeaders: false,       // disable X-RateLimit-* headers
  // ipv6Subnet: 56, // optional — remove unless you specifically need it
});
