import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { generateVerificationToken, generateResetPasswordToken, sendVerificationEmail, sendPasswordResetEmail } from '../services/email';
import { ensureAuthenticated } from '../services/oauth';

const router = Router();

// Verify email using the token
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Find user with this token
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token'
      });
    }
    
    // Check if token is expired
    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token has expired'
      });
    }
    
    // Mark email as verified and clear the token
    await storage.verifyUserEmail(user.id);
    
    // Redirect to a success page or login page
    return res.redirect('/email-verified');
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify email'
    });
  }
});

// Request a new verification email
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found'
      });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified'
      });
    }
    
    // Generate new verification token
    const token = await generateVerificationToken(user.id);
    
    // Generate verification URL
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email/${token}`;
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user, verificationUrl);
    
    if (emailSent) {
      return res.status(200).json({ 
        success: true, 
        message: 'Verification email sent'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while sending verification email'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({ 
        success: true, 
        message: 'If an account with that email exists, we sent a password reset link'
      });
    }
    
    // Generate reset password token
    const token = await generateResetPasswordToken(user.id);
    
    // Generate reset URL
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user, resetUrl);
    
    return res.status(200).json({ 
      success: true, 
      message: 'If an account with that email exists, we sent a password reset link'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request'
    });
  }
});

// Reset password using token
router.post('/reset-password/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password is required'
      });
    }
    
    // Find user with this token
    const user = await storage.getUserByResetPasswordToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token'
      });
    }
    
    // Check if token is expired
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token has expired'
      });
    }
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update user's password and clear the reset token
    await storage.updateUserPassword(user.id, hashedPassword);
    
    // Clear reset token
    await storage.updateUserResetPasswordToken(user.id, "", new Date());
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while resetting your password'
    });
  }
});

// Login route
router.post('/login', (req: Request, res: Response, next: Function) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      console.error('Error in local authentication:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error occurred' 
      });
    }
    
    if (!user) {
      // Authentication failed
      return res.status(401).json({ 
        success: false, 
        message: info?.message || 'Invalid username or password'
      });
    }
    
    // Log in the authenticated user
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Error during login:', loginErr);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to establish session'
        });
      }
      
      console.log('User successfully logged in:', user.username);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          subscriptionTier: user.subscriptionTier
        }
      });
    });
  })(req, res, next);
});

// Logout route
router.get('/logout', (req: Request, res: Response) => {
  // Check if user is authenticated first
  if (!req.isAuthenticated()) {
    return res.status(200).json({ 
      success: true, 
      message: 'Already logged out' 
    });
  }
  
  const username = (req.user as any)?.username || 'Unknown';
  
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    
    console.log('User successfully logged out:', username);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });
  });
});

// Get current user information
router.get('/current-user', ensureAuthenticated, (req: Request, res: Response) => {
  try {
    // The user is already attached to the request by Passport
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }
    
    // Return the user data
    res.json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while retrieving user data' 
    });
  }
});

export default router;