const CronJob = require('cron').CronJob;
import { populatePosts } from './posts';
import { populateUsers } from './users';
import { populateComments } from './comments';
import { populateGroups } from './groups';

const PostsCronJob = new CronJob(
	'0 */37 * * * *',
	function () {
		populatePosts(1);
	},
	null,
	true,
	'Asia/Jerusalem'
);

const UsersCronJob = new CronJob(
	'0 */75 * * * *',
	function () {
		populateUsers(1);
	},
	null,
	true,
	'Asia/Jerusalem'
);

const CommentsCronJob = new CronJob(
	'0 */17 * * * *',
	function () {
		populateComments(1);
	},
	null,
	true,
	'Asia/Jerusalem'
);

const GroupsCronJob = new CronJob(
	'*/10 * * * * *',
	function () {
		populateGroups(1);
	},
	null,
	true,
	'Asia/Jerusalem'
);

PostsCronJob.start();
UsersCronJob.start();
CommentsCronJob.start();
GroupsCronJob.start();
