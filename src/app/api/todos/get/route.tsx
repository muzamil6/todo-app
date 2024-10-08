import { NextRequest, NextResponse } from 'next/server';
import prismadb from '../../../../libs/prismadb';

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email } = reqBody;

    if (!email) {
      throw new Error('Email is required');
    }

    const lists = await prismadb.list.findMany({ where: { email } });
    return NextResponse.json(lists, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `Error: ${error.message}`,
        success: false,
      },
      { status: 500 }
    );
  }
}
