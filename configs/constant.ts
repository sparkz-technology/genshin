export const constant = {
    NODE_ENV: process.env.NODE_ENV || "development",
    JWT_SECRET: process.env.JWT_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    GITHUB_ID: process.env.GITHUB_ID!,
    GITHUB_SECRET: process.env.GITHUB_SECRET!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    REPLACE_FROM: process.env.REPLACE_FROM!,
    REPLACE_TO: process.env.REPLACE_TO!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
};