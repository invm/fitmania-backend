const passport = require('passport');
import User from '../models/User';

passport.serializeUser((UserID: any, done: Function) => {
  done(null, UserID);
});

passport.deserializeUser(async (UserID: any, done: Function) => {
  try {
    let user = await User.findOne({ _id: UserID });
    
    if (!user) {
      done('User does not exist', null);
    } else {
      done(null, user);
    }
  } catch (err) {
    done(err, null);
  }
});
