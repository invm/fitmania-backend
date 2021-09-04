const sgMail = require('@sendgrid/mail');
const nconf = require('nconf');

async function GenerateSystemEmail(content: String, emailTitle: String, to: String) {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	const msg = {
		to: to,
		from: process.env.SYSTEM_EMAIL,
		subject: emailTitle,
		html: content
	};

	let sendGridResponse = await sgMail.send(msg);

	if (sendGridResponse[0].statusCode !== 202) {
		console.log(sendGridResponse[0]);
		throw 'Error sending email';
	}
}

/**
 *  This service generates the content of the otp mail
 *
 * @return Promise - Returns whether the service was successful or not.
 * @throws Error - In case there are any issues during service process
 * @param email
 * @param otp
 */
const sendOTP = async function (email: String, otp: String) {
	let emailTitle = 'FitMania - One time password';

	let content = `<h3 style="font-size: 24px;">
	Hi, here is your one time password for ${nconf.get(
		'server:name'
	)}, <code style="background-color: #00acff;color: white;">${otp}</code>.<br>
	</h3>
	`;

	GenerateSystemEmail(content, emailTitle, email).then();
};

export default { sendOTP };
