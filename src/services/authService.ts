/**
 * Auth Service — AWS Cognito integration for D-Technician FSM
 *
 * Handles: signUp, confirmSignUp, signIn, signOut, getCurrentUser, fetchUserAttributes
 * Falls back gracefully when Amplify is not configured (local dev).
 */

import type { UserRole } from '../types';

export interface AuthResult {
  success: boolean;
  message: string;
  needsConfirmation?: boolean;
  needsNewPassword?: boolean;
  userId?: string;
  email?: string;
  role?: UserRole;
  name?: string;
}

let isAmplifyAuthReady = false;

/**
 * Check if Amplify Auth is available
 */
export function isAuthConfigured(): boolean {
  return isAmplifyAuthReady;
}

/**
 * Initialize auth — call once after Amplify.configure()
 */
export async function initAuth(): Promise<void> {
  try {
    const { getCurrentUser } = await import('aws-amplify/auth');
    await getCurrentUser();
    isAmplifyAuthReady = true;
  } catch (err: any) {
    // If the error is "UserUnAuthenticatedException" that means Amplify IS configured, user just isn't signed in
    if (err?.name === 'UserUnAuthenticatedException' || err?.message?.includes('User needs to be authenticated')) {
      isAmplifyAuthReady = true;
    } else {
      console.warn('[Auth] Amplify Auth not available:', err?.message);
      isAmplifyAuthReady = false;
    }
  }
}

/**
 * Sign up a new user with Cognito
 */
export async function cognitoSignUp(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'technician'
): Promise<AuthResult> {
  try {
    const { signUp } = await import('aws-amplify/auth');
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
          'custom:role': role,
        },
      },
    });

    if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
      return {
        success: true,
        message: 'Verification code sent to your email.',
        needsConfirmation: true,
        email,
      };
    }

    return {
      success: true,
      message: 'Account created successfully.',
      email,
    };
  } catch (err: any) {
    console.error('[Auth] SignUp error:', err);
    return {
      success: false,
      message: getAuthErrorMessage(err),
    };
  }
}

/**
 * Confirm sign up with verification code
 */
export async function cognitoConfirmSignUp(
  email: string,
  confirmationCode: string
): Promise<AuthResult> {
  try {
    const { confirmSignUp } = await import('aws-amplify/auth');
    await confirmSignUp({
      username: email,
      confirmationCode,
    });

    return {
      success: true,
      message: 'Email verified! You can now sign in.',
    };
  } catch (err: any) {
    console.error('[Auth] ConfirmSignUp error:', err);
    return {
      success: false,
      message: getAuthErrorMessage(err),
    };
  }
}

/**
 * Resend verification code
 */
export async function cognitoResendCode(email: string): Promise<AuthResult> {
  try {
    const { resendSignUpCode } = await import('aws-amplify/auth');
    await resendSignUpCode({ username: email });
    return {
      success: true,
      message: 'Verification code resent to your email.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: getAuthErrorMessage(err),
    };
  }
}

/**
 * Sign in with Cognito
 */
export async function cognitoSignIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { signIn } = await import('aws-amplify/auth');
    const result = await signIn({
      username: email,
      password,
    });

    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      return {
        success: false,
        message: 'Please verify your email first.',
        needsConfirmation: true,
        email,
      };
    }

    // Handle forced password change (admin-created users with temporary password)
    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return {
        success: false,
        message: 'You must set a new password.',
        needsNewPassword: true,
        email,
      };
    }

    if (result.isSignedIn) {
      // Fetch user attributes
      const userInfo = await fetchCurrentUser();
      return {
        success: true,
        message: 'Signed in successfully.',
        ...userInfo,
      };
    }

    return {
      success: false,
      message: `Sign in requires additional steps: ${result.nextStep?.signInStep || 'unknown'}`,
    };
  } catch (err: any) {
    console.error('[Auth] SignIn error:', err);
    return {
      success: false,
      message: getAuthErrorMessage(err),
    };
  }
}

/**
 * Complete new password challenge (for admin-created users)
 */
export async function cognitoConfirmNewPassword(
  newPassword: string
): Promise<AuthResult> {
  try {
    const { confirmSignIn } = await import('aws-amplify/auth');
    const result = await confirmSignIn({
      challengeResponse: newPassword,
    });

    if (result.isSignedIn) {
      const userInfo = await fetchCurrentUser();
      return {
        success: true,
        message: 'Password updated and signed in successfully.',
        ...userInfo,
      };
    }

    return {
      success: false,
      message: 'Password update requires additional steps.',
    };
  } catch (err: any) {
    console.error('[Auth] ConfirmNewPassword error:', err);
    return {
      success: false,
      message: getAuthErrorMessage(err),
    };
  }
}

/**
 * Sign out
 */
export async function cognitoSignOut(): Promise<void> {
  try {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
  } catch (err) {
    console.error('[Auth] SignOut error:', err);
  }
}

/**
 * Fetch current authenticated user info
 */
export async function fetchCurrentUser(): Promise<{
  userId: string;
  email: string;
  name: string;
  role: UserRole;
} | null> {
  try {
    const { getCurrentUser, fetchUserAttributes } = await import('aws-amplify/auth');
    const { userId } = await getCurrentUser();
    const attributes = await fetchUserAttributes();

    return {
      userId,
      email: attributes.email || '',
      name: attributes.name || attributes.email || 'User',
      role: (attributes['custom:role'] as UserRole) || 'technician',
    };
  } catch {
    return null;
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { getCurrentUser } = await import('aws-amplify/auth');
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Map AWS Cognito error codes to user-friendly messages
 */
function getAuthErrorMessage(error: any): string {
  const code = error?.name || error?.code || '';
  const message = error?.message || '';

  switch (code) {
    case 'UserAlreadyAuthenticatedException':
      return 'You are already signed in.';
    case 'UsernameExistsException':
      return 'An account with this email already exists.';
    case 'InvalidPasswordException':
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol.';
    case 'UserNotFoundException':
    case 'NotAuthorizedException':
      return 'Invalid email or password.';
    case 'CodeMismatchException':
      return 'Invalid verification code. Please try again.';
    case 'ExpiredCodeException':
      return 'Verification code has expired. Please request a new one.';
    case 'LimitExceededException':
      return 'Too many attempts. Please wait and try again.';
    case 'UserNotConfirmedException':
      return 'Please verify your email before signing in.';
    default:
      if (message.includes('Password')) {
        return 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol.';
      }
      return message || 'An unexpected error occurred. Please try again.';
  }
}
