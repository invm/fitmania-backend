/* App notifications */
const notifications = {
	newComment: {
		title: 'New comment',
		body: 'Somebody just posted a new comment on your post, view it now!',
	},
	userJoined: {
		title: 'New event participant!',
		body: 'A new user has joined your open event! See who it was now!',
	},
	userLeft: {
		title: 'Participant left',
		body: 'One of the participant of your event has left it. View the event now.',
	},
	newJoinRequest: {
		title: 'New event participation request!',
		body: 'Somebody just asked to join your event! View the event now!',
	},
	participationPermitted: {
		title: "You've been permitted!",
		body: 'Your participation request has been approved! View the participants now!',
	},
	participationProhibited: {
		title: 'Participation prohibited',
		body: 'We are very sorry but your participation in the requested event has not been approved. Better luck next time!',
	},
	mayAskToParticipateAgain: {
		title: 'Your participation prohibition has been canceled!',
		body: 'You may ask to join the event that you have been prohibited from participating from.',
	},
	newFriendRequest: {
		title: 'New friend request!',
		body: 'You have a new friends request from ',
	},
	requestAccepted: {
		title: 'You friend request has been accepted!',
		body: 'You are now friends with ',
	},
};

export default notifications;
