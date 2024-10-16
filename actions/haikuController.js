'use server';

import { redirect } from 'next/navigation';

import { ObjectId } from 'mongodb';

import { getUserFromCookie } from '../lib/getUser';
import { getCollection } from '../lib/db';

function isAlphaNumericWithBasics(text) {
	const regex = /^[a-zA-Z0-9 .,]*$/;

	return regex.test(text);
}

async function sharedHaikuLogic(formData, user) {
	const errors = {};

	const userHaiku = {
		line1: formData.get('line1'),
		line2: formData.get('line2'),
		line3: formData.get('line3'),
		author: ObjectId.createFromHexString(user.userId),
	};

	if (typeof userHaiku.line1 !== 'string') {
		userHaiku.line1 = '';
	}
	if (typeof userHaiku.line2 !== 'string') {
		userHaiku.line2 = '';
	}
	if (typeof userHaiku.line3 !== 'string') {
		userHaiku.line3 = '';
	}

	userHaiku.line1 = userHaiku.line1.replace(/(\r\n|\n|\r)/g, ' ');
	userHaiku.line2 = userHaiku.line2.replace(/(\r\n|\n|\r)/g, ' ');
	userHaiku.line3 = userHaiku.line3.replace(/(\r\n|\n|\r)/g, ' ');

	userHaiku.line1 = userHaiku.line1.trim();
	userHaiku.line2 = userHaiku.line2.trim();
	userHaiku.line3 = userHaiku.line3.trim();

	if (userHaiku.line1.length < 5) {
		errors.line1 = 'Too few syllables; must be at least 5.';
	}
	if (userHaiku.line1.length > 25) {
		errors.line1 = 'Too many syllables; must be less than 25.';
	}

	if (userHaiku.line2.length < 7) {
		errors.line2 = 'Too few syllables; must be at least 7.';
	}
	if (userHaiku.line2.length > 35) {
		errors.line2 = 'Too many syllables; must be less than 35.';
	}

	if (userHaiku.line3.length < 5) {
		errors.line3 = 'Too few syllables; must be at least 5.';
	}
	if (userHaiku.line3.length > 25) {
		errors.line3 = 'Too many syllables; must be less than 25.';
	}

	if (!isAlphaNumericWithBasics(userHaiku.line1)) {
		errors.line1 = 'No special characters allowed';
	}
	if (!isAlphaNumericWithBasics(userHaiku.line2)) {
		errors.line2 = 'No special characters allowed';
	}
	if (!isAlphaNumericWithBasics(userHaiku.line3)) {
		errors.line3 = 'No special characters allowed';
	}

	if (userHaiku.line1.length == 0) {
		errors.line1 = 'This field is required';
	}
	if (userHaiku.line2.length == 0) {
		errors.line2 = 'This field is required';
	}
	if (userHaiku.line3.length == 0) {
		errors.line3 = 'This field is required';
	}

	return {
		errors,
		userHaiku,
	};
}

export const createHaiku = async function (prevState, formData) {
	const user = await getUserFromCookie();

	if (!user) {
		return redirect('/');
	}

	const results = await sharedHaikuLogic(formData, user);

	if (results.errors.line1 || results.errors.line2 || results.errors.line3) {
		return { errors: results.errors };
	}

	// Save into DB
	const haikusCollection = await getCollection('haikus');
	const newHaiku = await haikusCollection.insertOne(results.userHaiku);

	return redirect('/');
};

export const editHaiku = async function (prevState, formData) {
	const user = await getUserFromCookie();

	if (!user) {
		return redirect('/');
	}

	const results = await sharedHaikuLogic(formData, user);

	if (results.errors.line1 || results.errors.line2 || results.errors.line3) {
		return { errors: results.errors };
	}

	// Save into DB
	const haikusCollection = await getCollection('haikus');
	let haikuId = formData.get('haikuId');

	if (typeof haikuId !== 'string') {
		haikuId = '';
	}

	// Makes sure you are the author of this post
	const haikuInQuestion = await haikusCollection.findOne({
		_id: ObjectId.createFromHexString(haikuId),
	});

	if (haikuInQuestion.author.toString() !== user.userId) {
		return redirect('/');
	}

	await haikusCollection.findOneAndUpdate(
		{ _id: ObjectId.createFromHexString(haikuId) },
		{ $set: results.userHaiku },
	);

	return redirect('/');
};

export const deleteHaiku = async function (formData) {
	const user = await getUserFromCookie();

	if (!user) {
		return redirect('/');
	}

	const haikusCollection = await getCollection('haikus');
	let haikuId = formData.get('id');

	if (typeof haikuId !== 'string') {
		haikuId = '';
	}

	// Makes sure you are the author of this post
	const haikuInQuestion = await haikusCollection.findOne({
		_id: ObjectId.createFromHexString(haikuId),
	});

	if (haikuInQuestion.author.toString() !== user.userId) {
		return redirect('/');
	}

	await haikusCollection.deleteOne({
		_id: ObjectId.createFromHexString(haikuId),
	});

	return redirect('/');
};
