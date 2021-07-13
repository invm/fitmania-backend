/**
 * Contains an assortment of helper authentication functions
 */

/**
 * This function generates a session for a given user.
 *
 * Mechanism:
 * 1) Activate the Passport login method on the request and set the session lifespan based on the sessionTimer parameter.
 * 2) If the enforceSingleSession parameter is true, a single session rule will be enforced on the user as follows
 * 	2.1) Extract the session store from the request, extract MongoDB driver out of it and extract the session collection out of it.
 * 	2.2) Delete all the older sessions of the user.
 *
 * @param req - Request of the user
 * @param user - User data
 * @param sessionTimer - Lifespan of the session - measured in MS.
 * @param enforceSingleSession - A boolean that is used to indicate if a single session rule needs to be enforced.
 * @returns {Promise<void>}
 */

const createSession = async function (req: any, user: any) {
  // Authenticate the user and create a session
  req.login(user, function (err: any) {
    if (err) {
      throw err;
    }
  });

  // Single session enforcement
  let sessionCollectionName = req.sessionStore.collectionName; // Name of the session collection
  let collection = req.sessionStore.db.collection(sessionCollectionName); // Extract the collection from the MongoDB driver so we can run operations on it
  let currentSessionID = req.sessionID; // ID of the current session which we will preserve
  let res = await collection.deleteMany({
    'session.passport.user': req.user._id, // Find all the sessions of the user
    _id: { $ne: currentSessionID }, // Filter out the current session
  });
};

/**
 * Destroys the session of the requester
 */
const logout = async (req: Express.Request) => {
  req.logout(); // logs the user out
  req.session.destroy(() => {}); // removes the session from the DB
};

export { logout, createSession };
