import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'drj';

export async function createToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));
  
  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24, // 1 day
  });
  
  return response;
}

export function removeAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 0,
  });
  
  return response;
}

export async function validateRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) return null;
  
  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}