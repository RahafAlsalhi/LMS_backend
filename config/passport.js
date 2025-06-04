import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import {
  createUser,
  getUserById,
  getUserbyGoogleId,
} from "../models/user.model.js";

import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await getUserbyGoogleId(profile.id);
        if (user) {
          return done(null, user);
        }
        const newUser = {
          name: profile.displayName,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null,
          avatar:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          oauth_provider: "google",
          oauth_id: profile.id,
          role: "student",
          password: null,
        };
        const userCreated = await createUser(newUser);
        return done(null, userCreated);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id)); //store user id in session

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}); //get user details from session by id

export default passport;
