const sgMail = require('@sendgrid/mail');
const nconf = require('nconf');

async function GenerateSystemEmail(
  content: String,
  emailTitle: String,
  to: String
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: to,
    from: nconf.get('email:address'),
    subject: emailTitle,
    html: content,
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
  let emailTitle = 'Admin panel login OTP';

  let content = `
			Hi, here is your OTP for ${nconf.get(
        'server:name'
      )}, it will only last ${nconf.get(
    'auth:otpTimer'
  )} minutes so be quick!: <code style="background-color: #767676;color: white">${otp}</code>.<br>
		`;

  await GenerateSystemEmail(content, emailTitle, email);
};

export default { sendOTP };
