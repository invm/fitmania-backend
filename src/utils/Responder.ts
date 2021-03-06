import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import * as _ from 'lodash';

interface Err {
	data?: any;
	field?: string;
	msg?: any;
	errorCode?: any;
}

interface Res {
	status?: number;
	errors?: Err[];
	msg?: string;
	data?: any;
	errorCode?: number;
}

export const Respond = (
	req: Request,
	res: Response,
	success: boolean,
	response: {
		msg?: string;
		data?: any;
		errorCode?: number;
		status?: number;
		errors?: any[];
	}
) => {
	const time = new Date();
	// @ts-ignore
	const processTime = time.getTime() - req.startTime;
	let finalResponse: Res = {};

	success
		? console.log(chalk.green(`Request ended successfully.`))
		: console.log(chalk.red(`Request ended unsuccessfully.`));
	if (!success && response.msg) console.log(chalk.red(`Reason: ${response.msg}`));
	console.log(`The request was processed in ${processTime} ms.`);

	let responseStatus = response?.status ? response.status : success ? 200 : 500; // If a status is given, use it, else determine using the success parameter.

	/**
	 * Returns the response depending on the type of the response:
	 * 1) If a msg, data, errorCode or errors are provided, sends them.
	 * 2) Returns a simple status code if none of the above.
	 */
	if (response?.msg || response?.data || response?.errorCode || response?.errors) {
		if (response?.msg) {
			finalResponse.msg = response.msg;
		}

		if (response?.data) {
			finalResponse.data = response.data;
		}

		if (response?.errorCode) {
			finalResponse.errorCode = response.errorCode;
		}

		if (response?.errors) {
			finalResponse.errors = response.errors;
		}

		res.status(responseStatus).send(finalResponse);
	} else {
		res.status(responseStatus).send();
	}

	console.log(chalk.green('----------------------'), '\n');
};

const ServiceHandler = async (req: Request, res: Response, next: NextFunction, service: Function) => {
	if (verifyValidation(req, res)) {
		let requestSucceeded = true; // If no service was provided then the default response is positive with status 200
		let response: { [key: string]: any } = {};
		if (service) {
			try {
				let result = await service(req);
				if (result?.data !== undefined) response.data = result.data;
				if (result?.msg) response.msg = result.msg;
				if (result?.errors) response.errors = result.errors;
			} catch (error) {
				console.log('Error finishing service', error, error?.message);
			}
		}
		Respond(req, res, requestSucceeded, response);
	}
};

const Responder = (service: Function) => {
	return async function (req: Request, res: Response, next: NextFunction) {
		return ServiceHandler(req, res, next, service);
	};
};

const isObject = (obj: any) => {
	return obj && typeof obj === 'object' && obj.constructor === Object;
};

/**
 * Used to detect the type of the request and return the appropriate location of the parameters.
 */

const getParamType = (req: Request): string => {
	switch (req.method) {
		case 'GET':
			return 'query';
		case 'POST':
		case 'PUT':
		case 'PATCH':
		case 'DELETE':
			return 'body';
		default:
			return 'body';
	}
};

/**
 * Used to check if the request has any attached validation errors from express validator and also verify that there are no unexpected fields in the request.
 *
 * If errors are found by the function:
 * 1) They will all be logged to the console.
 * 2) One of them will be returned as a response to the client.
 *
 * If there are fields that were not validated by express validator and were provided in the request an error is returned. All fields must be validated and a proper request must be made accordingly.
 *
 * @param req
 * @param res
 * @returns {boolean} - Returns true of there are no errors, false if there are.
 */
const verifyValidation = (req: Request, res: Response) => {
	const errors = validationResult(req);
	const hasValidationErrors = !errors.isEmpty();
	const validationErrors = errors.array().map((v) => ({
		...v,
		value: isObject(v.value) ? JSON.stringify(v.value) : v.value
	}));

	if (
		(req.method === 'GET' && Object.keys(req.body).length > 0) ||
		(req.method !== 'GET' && Object.keys(req.query).length > 0)
	) {
		Respond(req, res, false, {
			msg: 'Use request params when using GET requests. Otherwise, use body.',
			status: 400
		});
		return false;
	}

	if (hasValidationErrors) {
		let response: Res = {
			status: validationErrors[0].msg.status ? validationErrors[0].msg.status : 422 // Use the status code of the first error if one is available else status 422 is the default
		};

		console.error(`${chalk.yellow('Errors have been found during validation of the request:')}`);

		let param: string;
		let newParamFlag = true;
		let msg;

		validationErrors.forEach(function (err) {
			if (err.param !== param) {
				param = err.param;
				newParamFlag = true;
			}

			msg = err.msg?.msg ?? err.msg?.error?.msg ?? err.msg;

			if (newParamFlag) {
				console.error(`- Param: '${param}' with value of '${err.value}':`);
				newParamFlag = false;
			}

			console.error(`\t - Message: '${msg}'`);
		});

		// Unwrapping the App error codes
		const errors: Err[] = [];

		validationErrors.forEach((err) => {
			let error: Err = {
				msg: `${err.param} - ${err.msg}`
			};
			if (err.value) error.data = err.value;
			// An error msg might not be related to a specific field
			if (err.param) {
				error.field = err.param;
			}
			errors.push(error);
		});

		response.errors = errors;

		Respond(req, res, false, response);
		return false;
	}

	const validatedFields = Object.keys(matchedData(req)); // Get all validated fields from the request
	// @ts-ignore
	const requestFields = Object.keys(req[getParamType(req)]); // Get all fields from the request
	const unvalidatedFields = _.difference(requestFields, validatedFields); // Find all fields that were in the request that were not validated

	if (unvalidatedFields.length > 0) {
		console.error(
			'The following fields were not validated by express validator, either they are expected and must be validated or they are unexpected and as such the request is malformed.'
		);

		unvalidatedFields.forEach(function (field) {
			console.error(`\t - Param: '${field}'.`);
		});

		let errorMessage = `An unexpected field was provided - ${unvalidatedFields[0]}.`;

		Respond(req, res, false, { errors: [{ msg: errorMessage }], status: 422 });
		return false;
	}

	return true;
};

export default Responder;
