import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

export async function getUserFromCookie() {
	const cookie = cookies().get('haiku')?.value;

	if (cookie) {
		try {
			const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
			return decoded;
		} catch (error) {
			return null;
		}
	}
}
