import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 50 * 1000,
    max: 10,
});

export default apiLimiter;