import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db/client.server";
import { sendEmail } from "~/mailer.server";
import { accounts, sessions, users, verifications } from "~/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password — Movie Zone",
        text: [
          `Hi ${user.name ?? "there"},`,
          ``,
          `Click the link below to reset your Movie Zone password:`,
          ``,
          url,
          ``,
          `This link expires in an hour. If you didn't request this, you can ignore this email.`,
        ].join("\n"),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email — Movie Zone",
        text: [
          `Hi ${user.name ?? "there"},`,
          ``,
          `Click the link below to verify your email and finish setting up your Movie Zone account:`,
          ``,
          url,
          ``,
          `This link expires in an hour. If you didn't sign up, you can ignore this email.`,
        ].join("\n"),
      });
    },
  },
});
