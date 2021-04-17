import { Response } from 'express';
import chalk from 'chalk';

module.exports = {
	responseService: async (
		req: Request,
		res: Response,
		params: Object,
		action: Function,
		model: any
	) => {
		let startTime = Number(new Date()); // This is used to calculate how long it takes to process the request.
		console.log(req.body);
		try {
			let response = await action(model, params); // Activation of the target service

			return res.status(200).json(response);
		} catch (err) {
			let errors = Object.entries(err.errors).map(
				(error: any) => error[1].message
			);
			return res.status(400).json(errors);
		}
	},
};
