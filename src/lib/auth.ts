import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor, username } from "better-auth/plugins";
import { APP_NAME, isSuperAdmin } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // Akun baru harus diaktifkan admin dulu, jadi tidak langsung login.
    autoSignIn: false,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    // Belum ada mailer: tautan reset ditulis ke log server (setara MAIL_MAILER=log).
    sendResetPassword: async ({ user, url }) => {
      console.info(`[reset-password] ${user.email}: ${url}`);
    },
  },

  user: {
    additionalFields: {
      nip: { type: "string", required: false, unique: true },
      isActive: { type: "boolean", required: false, defaultValue: false, input: false },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        if (isSuperAdmin((user as { username?: string }).username)) {
          throw new APIError("BAD_REQUEST", { message: "Akun admin utama tidak dapat dihapus." });
        }
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Satu pintu untuk semua cara login (password, 2FA, passkey):
        // akun non-aktif tidak boleh mendapat sesi.
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });

          if (!user?.isActive) {
            throw new APIError("FORBIDDEN", {
              message: "Akun Anda belum diaktifkan. Silakan hubungi admin.",
              code: "ACCOUNT_INACTIVE",
            });
          }
        },
      },
    },
  },

  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
    }),
    twoFactor({ issuer: APP_NAME }),
    passkey({ rpName: APP_NAME }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
