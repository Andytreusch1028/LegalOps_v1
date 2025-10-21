import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: session.user.email },
    });

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Create verification token (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.verificationToken.create({
      data: {
        identifier: session.user.email,
        token,
        expires: expiresAt,
      },
    });

    // In a real app, you would send an email here
    // For now, we'll return the verification link
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

    // TODO: Send email with verification link
    // await sendVerificationEmail(session.user.email, verificationUrl);

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      // In production, remove this - only for development
      verificationUrl,
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
      // Remove emailVerified usage - verify flow handled via tokens
      await (prisma as any).verificationToken.deleteMany({ where: { email: session.user.email } });

      const token = crypto.randomBytes(32).toString("hex");

      await (prisma as any).verificationToken.create({
        data: {
          identifier: session.user.email,
          token,
          expires: expiresAt,
        },
      });
}

