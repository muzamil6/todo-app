import { NextRequest, NextResponse } from "next/server";
import prisma from '../../../libs/prismadb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (!existingUser) {
            return new NextResponse("User does not exist", { status: 400 });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: verificationToken,
                passwordResetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
            },
        });

        const verificationLink = `${process.env.NEXTAUTH_URL}/resetPassword?token=${verificationToken}`;
        console.log(verificationLink);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password",
            html: `Click <a href="${verificationLink}">here</a> to reset your password`,
        };

        await transporter.sendMail(mailOptions);
        return new NextResponse("The reset token has been sent to your email", { status: 200 });
    } catch (error: any) {
        console.log("FORGET_PASSWORD", error);
        return new NextResponse(error.message, { status: 500 });
    }
}
