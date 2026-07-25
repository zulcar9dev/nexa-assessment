import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { username } from "better-auth/plugins";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    trustedOrigins: [
        "https://kreditkonsumer.my.id",
        "https://www.kreditkonsumer.my.id",
        process.env.BETTER_AUTH_URL || "",
        process.env.NEXT_PUBLIC_APP_URL || ""
    ].filter(Boolean),
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        password: {
            hash: async (password: string) => {
                return bcrypt.hash(password, 10);
            },
            verify: async ({ password, hash }: { password: string; hash: string }) => {
                return bcrypt.compare(password, hash);
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
            },
        },
    },
    plugins: [
        username({
            schema: {
                user: {
                    fields: {
                        username: "username",
                        displayUsername: "name",
                    }
                }
            }
        })
    ],
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    session: {
        expiresIn: 12 * 60 * 60, // 12 jam (1 shift kerja penuh)
    }
});
