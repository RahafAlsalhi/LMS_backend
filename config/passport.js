import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  createUser,
  getUserById,
  getUserbyGoogleId,
  getUserByEmail,
  updateUser,
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
        // Validate profile data
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("No email provided by Google"), null);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;

        // Check if user exists by Google ID first
        let user = await getUserbyGoogleId(googleId);
        if (user) {
          // User exists with this Google ID
          return done(null, user);
        }

        // Check if user exists by email (maybe registered with email/password)
        user = await getUserByEmail(email);
        if (user) {
          // User exists with email but no Google ID - link accounts
          if (!user.oauth_id || !user.oauth_provider) {
            // Update existing user to include Google OAuth info
            const updatedUser = await updateUser({
              id: user.id,
              oauth_provider: "google",
              oauth_id: googleId,
              avatar_url:
                user.avatar_url ||
                (profile.photos && profile.photos[0]
                  ? profile.photos[0].value
                  : null),
              name: user.name,
              email: user.email,
              role: user.role,
            });
            return done(null, updatedUser);
          } else {
            // User has different OAuth provider - this could be a conflict
            return done(
              new Error("Email already associated with different provider"),
              null
            );
          }
        }

        // Create new user
        const newUserData = {
          name:
            profile.displayName ||
            profile.name?.givenName + " " + profile.name?.familyName ||
            "Unknown User",
          email: email,
          avatar_url:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          oauth_provider: "google",
          oauth_id: googleId,
          role: "student", // Default role for new users
          password_hash: null, // No password for OAuth users
        };

        const createdUser = await createUser(newUserData);
        if (!createdUser) {
          return done(new Error("Failed to create user"), null);
        }

        return done(null, createdUser);
      } catch (err) {
        console.error("Google OAuth Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user for session (store only user ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (get full user data)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    if (!user) {
      return done(new Error("User not found during deserialization"), null);
    }

    if (!user.is_active) {
      return done(new Error("User account is deactivated"), null);
    }

    done(null, user);
  } catch (err) {
    console.error("Passport deserializeUser error:", err);
    done(err, null);
  }
});

export default passport;
