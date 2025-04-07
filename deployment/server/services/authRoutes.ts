// Auth routes
import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ensureAuthenticated } from './oauth';
import { Request, Response } from 'express';
import { storage } from '../storage';
import { sendVerificationEmail } from './email';

const router = express.Router();

// Generate a verification token for email verification
async function generateVerificationToken(userId: number): Promise<string> {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // Token valid for 24 hours
  
  // Store the token in the database
  await storage.updateUserVerificationToken(userId, token, expires);
  
  return token;
}

// Debug route for OAuth configuration
// Comprehensive debug endpoint with enhanced OAuth checks
router.get('/debug', (req: Request, res: Response) => {
  // Base information
  const domain = req.protocol + '://' + req.get('host');
  const httpCallbackURL = `http://${req.get('host')}/auth/google/callback`;
  const httpsCallbackURL = `https://${req.get('host')}/auth/google/callback`;
  const configuredCallback = process.env.REPLIT_DOMAINS ? 
    `https://${process.env.REPLIT_DOMAINS}/auth/google/callback` : 
    '/auth/google/callback';
  
  // Check current user session
  const isAuthenticated = req.isAuthenticated();
  let sessionPassportStatus = 'No session';
  try {
    // Access session passport data securely
    const session = req.session as any;
    sessionPassportStatus = session && session.passport ? 'Session has passport data' : 'No passport data in session';
  } catch (e) {
    console.error('Error accessing session passport:', e);
  }
  
  // Session info
  const sessionInfo = req.session ? {
    id: req.session.id,
    passport: sessionPassportStatus,
    cookie: req.session.cookie ? {
      originalMaxAge: req.session.cookie.originalMaxAge,
      expires: req.session.cookie.expires,
      secure: req.session.cookie.secure,
      httpOnly: req.session.cookie.httpOnly,
    } : 'No cookie info'
  } : 'No session';
  
  // Format credentials for display (hide most of it)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const formattedClientId = googleClientId 
    ? `${googleClientId.substring(0, 8)}...${googleClientId.substring(googleClientId.length - 4)}` 
    : 'Not configured';
  const formattedClientSecret = googleClientSecret
    ? `${googleClientSecret.substring(0, 3)}...${googleClientSecret.substring(googleClientSecret.length - 3)}`
    : 'Not configured';
  
  // Validate OAuth configuration
  const googleOAuthConfigValid = !!(googleClientId && googleClientSecret);
  const clientIdFormatValid = googleClientId ? /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/.test(googleClientId) : false;
  const domainSetupValid = !!process.env.REPLIT_DOMAINS;
  
  // Return comprehensive debug information
  res.json({
    application: {
      timestamp: new Date().toISOString(),
      serverTime: new Date().toString(),
      domain,
      requestURL: req.originalUrl,
      requestOrigin: req.headers.origin || 'Not provided',
      requestReferrer: req.headers.referer || 'Not provided',
      requestUserAgent: req.headers['user-agent'] || 'Not provided'
    },
    oauthConfiguration: {
      // Callback URLs
      httpCallbackURL,
      httpsCallbackURL,
      configuredCallback,
      // Environment setup
      nodeEnv: process.env.NODE_ENV || 'Not set',
      replitDomain: process.env.REPLIT_DOMAINS || 'not set',
      // Google OAuth
      googleOAuth: {
        clientIdConfigured: !!googleClientId,
        clientSecretConfigured: !!googleClientSecret,
        clientId: formattedClientId,
        clientSecret: formattedClientSecret,
        clientIdFormatValid,
        configurationComplete: googleOAuthConfigValid && clientIdFormatValid && domainSetupValid,
        configurationIssues: [
          !googleClientId ? 'Google Client ID is missing' : null,
          !googleClientSecret ? 'Google Client Secret is missing' : null,
          googleClientId && !clientIdFormatValid ? 'Google Client ID format appears invalid' : null,
          !domainSetupValid ? 'REPLIT_DOMAINS environment variable is missing' : null
        ].filter(Boolean)
      }
    },
    authentication: {
      isAuthenticated,
      hasUser: !!req.user,
      user: req.user ? { 
        id: (req.user as any).id,
        username: (req.user as any).username,
        email: (req.user as any).email ? '(email hidden)' : null,
        displayName: (req.user as any).displayName,
        providerId: (req.user as any).providerId,
        subscriptionTier: (req.user as any).subscriptionTier
      } : 'Not authenticated'
    },
    session: sessionInfo,
    tips: [
      "Use the Google test OAuth flow by clicking the Google Sign-in button on the login page",
      "Check server logs for detailed OAuth flow information",
      "Verify Google Developer Console settings match the callback URL",
      "Ensure the Google OAuth consent screen is configured properly",
      "Try clearing cookies and browser cache if issues persist"
    ]
  });
});

// A special test route that directly connects to Google OAuth without passport
// Enhanced with error checking and debugging
router.get('/google/test', (req: Request, res: Response) => {
  console.log('Google OAuth test route accessed');
  
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials not configured properly');
    return res.status(500).send(`
      <html>
        <head><title>OAuth Configuration Error</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #d32f2f;">Google OAuth Configuration Error</h1>
          <p>Google OAuth credentials are not properly configured.</p>
          <ul>
            <li>Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}</li>
            <li>Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing'}</li>
          </ul>
          <p>Please check your environment variables and try again.</p>
          <p><a href="/auth/debug" style="color: #2196f3;">View detailed OAuth diagnostics</a></p>
          <p><a href="/login" style="color: #2196f3;">Return to login page</a></p>
        </body>
      </html>
    `);
  }
  
  // Use the Replit domain if available, otherwise fallback to request host
  const host = process.env.REPLIT_DOMAINS || req.get('host');
  const protocol = process.env.REPLIT_DOMAINS ? 'https' : req.protocol;
  
  // Build a proper callback URL
  const callbackURL = `${protocol}://${host}/auth/google/callback`;
  console.log(`Using callback URL: ${callbackURL}`);
  
  try {
    // Construct full Google OAuth URL with all required parameters
    const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID!)}` +
      `&redirect_uri=${encodeURIComponent(callbackURL)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email')}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&include_granted_scopes=true` +
      `&state=${encodeURIComponent(JSON.stringify({ timestamp: Date.now() }))}`;
      
    console.log('Generated Google OAuth URL (redacted):', 
      googleOAuthURL.replace(process.env.GOOGLE_CLIENT_ID!, 'CLIENT_ID_REDACTED'));
      
    // Redirect to Google OAuth login page
    return res.redirect(googleOAuthURL);
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return res.status(500).send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #d32f2f;">Error Generating OAuth URL</h1>
          <p>An error occurred while generating the Google OAuth URL.</p>
          <p><a href="/login" style="color: #2196f3;">Return to login page</a></p>
        </body>
      </html>
    `);
  }
});

// Define OAuth routes
// Simplified Google OAuth route - directly use passport.authenticate with options
router.get('/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Enhanced Google OAuth callback with detailed logging
router.get('/google/callback', (req: Request, res: Response, next: Function) => {
  // Log incoming callback details
  console.log('Google OAuth callback received:');
  console.log('- Query params:', JSON.stringify(req.query));
  console.log('- Has error:', !!req.query.error);
  console.log('- Has code:', !!req.query.code);
  
  // If there's an error, handle it directly
  if (req.query.error) {
    console.error('Google OAuth error:', req.query.error);
    return res.redirect(`/login?error=${req.query.error}`);
  }
  
  // If no authorization code is present, report error
  if (!req.query.code) {
    console.error('No authorization code received from Google');
    return res.redirect('/login?error=no_auth_code');
  }
  
  // Use custom callback for passport authentication
  passport.authenticate('google', (err: any, user: any, info: any) => {
    console.log('Passport authenticate callback executed');
    
    if (err) {
      console.error('Error in Google authentication:', err);
      return res.redirect('/login?error=auth_error');
    }
    
    if (!user) {
      console.log('Authentication failed, no user returned');
      return res.redirect('/login?error=auth_failed');
    }
    
    // Log in the authenticated user
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Error during login after OAuth:', loginErr);
        return res.redirect('/login?error=session_error');
      }
      
      console.log('Google OAuth successful, user logged in');
      console.log('User data:', {
        id: user.id,
        username: user.username,
        provider: user.providerId
      });
      
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    successRedirect: '/'
  })
);

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already taken' 
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already registered' 
        });
      }
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create the user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      email: email || null,
      displayName: username,
      emailVerified: false
    });
    
    // If email is provided, generate verification token and send email
    if (email) {
      const token = await generateVerificationToken(user.id);
      
      // Generate verification URL
      const baseUrl = process.env.APP_URL || `http://${req.get('host')}`;
      const verificationUrl = `${baseUrl}/api/auth/verify-email/${token}`;
      
      // Send verification email
      await sendVerificationEmail(user, verificationUrl);
    }
    
    // Return success response
    return res.status(201).json({ 
      success: true, 
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while creating user' 
    });
  }
});

router.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login?error=true',
    successRedirect: '/'
  })
);

router.get('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.redirect('/login');
  });
});

// Email verification endpoint
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).send('Verification token is required');
    }
    
    // Find user with this verification token
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(404).send('Invalid or expired verification token');
    }
    
    // Check if token is expired
    if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
      return res.status(400).send('Verification token has expired');
    }
    
    // Mark email as verified
    await storage.verifyUserEmail(user.id);
    
    // Redirect to login with success message
    return res.redirect('/login?verified=true');
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).send('An error occurred during email verification');
  }
});

router.get('/current-user', ensureAuthenticated, (req: Request, res: Response) => {
  const safeUser = req.user ? {
    id: (req.user as any).id,
    username: (req.user as any).username,
    email: (req.user as any).email,
    displayName: (req.user as any).displayName,
    avatar: (req.user as any).avatar,
    subscriptionTier: (req.user as any).subscriptionTier,
    providerId: (req.user as any).providerId
  } : null;

  console.log('Returning current user data:', safeUser ? {
    id: safeUser.id,
    username: safeUser.username,
    provider: safeUser.providerId
  } : 'No user found');
  
  res.json({ 
    success: true,
    user: safeUser,
    isAuthenticated: true
  });
});

export default router;