'use server';

import { getCollection } from '../lib/db';
import bcrypt from 'bcrypt';

function isAlphaNumeric(x) {
	const regex = /^[a-zA-Z0-9]*$/;
	return regex.test(x);
}

export const register = async function (prevState, formData) {
	const errors = {};
	const ourUser = {
		username: formData.get('username'),
		password: formData.get('password'),
	};

	if (typeof ourUser.username !== 'string') {
		ourUser.username = '';
	}
	if (typeof ourUser.password !== 'string') {
		ourUser.password = '';
	}

	ourUser.username = ourUser.username.trim();
	ourUser.password = ourUser.password.trim();

	// Username rules
	if (ourUser.username.length < 3) {
		errors.username = 'Username must be at least 3 characters';
	}
	if (ourUser.username.length > 30) {
		errors.username = 'Username cannot exceed 30 characters';
	}
	if (!isAlphaNumeric(ourUser.username)) {
		errors.username = 'You can only use a-z and 0-9';
	}
	if (ourUser.username === '') {
		errors.username = 'You must provide a username';
	}

	// Password rules
	if (ourUser.password.length < 12) {
		errors.password = 'Password must be at least 12 characters';
	}
	if (ourUser.password.length > 50) {
		errors.password = 'Password cannot exceed 50 characters';
	}
	if (ourUser.password === '') {
		errors.password = 'You must provide a password';
	}

	// Check if errors
	if (errors.username || errors.password) {
		return {
			errors: errors,
			success: false,
		};
	}

    // Hash password first

    const salt = bcrypt.genSaltSync(10);
    ourUser.password = bcrypt.hashSync(ourUser.password, salt);

	// Storing a new user in the database

    const usersCollection = await getCollection("users");
    await usersCollection.insertOne(ourUser);

	// Log the use in by giving them a cookie

    

	return {
		success: true,
	};
};
