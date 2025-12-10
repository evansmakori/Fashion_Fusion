# Error Code 9: Network Request Failed - Troubleshooting Guide

## What is Error Code 9?

**Error Code: 9** is Firebase's `auth/network-request-failed` error. This means the Firebase SDK cannot communicate with Google's Firebase servers to authenticate your user.

## Common Causes

1. **No Internet Connection** - Your device/browser has no active network connection
2. **Network Timeout** - Request to Firebase servers took too long and timed out
3. **Firewall/Proxy Blocking** - Your network firewall or proxy is blocking Firebase API requests
4. **CORS Issues** - Cross-Origin Resource Sharing policy preventing the request
5. **DNS Resolution Issues** - Cannot resolve Firebase domain names
6. **VPN/Proxy Interference** - VPN or corporate proxy blocking Google APIs
7. **Outdated Browser** - Browser too old to support modern HTTPS connections
8. **Content Security Policy** - Website's CSP headers blocking Firebase scripts

## Solutions

### 1. **Check Your Internet Connection**
```bash
# Test basic connectivity
ping google.com

# Or access Firebase directly
curl https://www.google.com
```

- **If failing**: Check your WiFi/network connection
- **If passing**: Move to next solution

### 2. **Check if Firebase Domain is Accessible**
```bash
# Test Firebase API access
curl https://identitytoolkit.googleapis.com

# Test with authentication
curl https://securetoken.googleapis.com
```

- **If these fail**: Your firewall is blocking Firebase
- **Contact your network administrator** if on corporate network

### 3. **Clear Browser Cache and Storage**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### 4. **Check Browser Console for Detailed Errors**
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for additional error messages
4. Check Network tab to see which requests are failing
5. Look for requests to:
   - `identitytoolkit.googleapis.com`
   - `securetoken.googleapis.com`
   - `www.googleapis.com`

### 5. **Disable Browser Extensions**
Some extensions (especially VPN, ad blockers, or privacy tools) can block Firebase:
- Try disabling extensions temporarily
- If error goes away, configure extension to allow Firebase domains

### 6. **Try Different Network**
- Try on mobile hotspot instead of WiFi
- Try on different WiFi network
- Try on wired connection
- This helps identify network-specific issues

### 7. **Check Firewall/Proxy Settings (Enterprise)**
If on corporate network:
- Ask IT to whitelist these domains:
  - `identitytoolkit.googleapis.com`
  - `securetoken.googleapis.com`
  - `www.googleapis.com`
  - `accounts.google.com`

### 8. **Update to Latest Browser**
- Firebase requires modern browser with TLS 1.2+ support
- Update to latest Chrome, Firefox, Safari, or Edge

## What We Fixed in the Code

The following improvements have been made to help diagnose and handle Error Code 9:

### 1. **Network Connectivity Detection**
```javascript
// New function to check if device has network access
async function checkNetworkConnectivity()
```
- Detects if device is completely offline
- Provides different error messages for no-internet vs. firewall-blocked scenarios

### 2. **Automatic Retry with Exponential Backoff**
```javascript
// New function to retry failed operations
async function retryOperation(operation)
```
- Automatically retries failed auth operations up to 3 times
- Uses exponential backoff: 1s → 2s → 4s delays
- Only retries on network errors, not auth failures

### 3. **Enhanced Error Messages**
The app now shows:
- ✅ "No internet connection detected" (if offline)
- ✅ "Network error connecting to Firebase. Please try again or check your firewall/proxy settings." (if firewall/timeout)
- ✅ Specific error messages for other auth failures

### 4. **Detailed Console Logging**
Firebase initialization and authentication attempts now log:
- ✅ Firebase config being loaded
- ✅ Auth provider initialization status
- ✅ Each retry attempt
- ✅ Final success/failure status

## How to Debug

### Enable Detailed Logging

1. Open Browser DevTools (F12)
2. Go to Console tab
3. You'll see logs like:
```
Initializing Firebase with config: {projectId: "fashion-fussion-app", ...}
Firebase app initialized successfully
Firebase Auth initialized successfully
Starting sign in process for: user@example.com
Attempt 1/4 for Sign in
... [if fails] Network error on attempt 1, retrying in 1000ms...
Attempt 2/4 for Sign in
... [if succeeds] Sign in successful for: user@example.com
```

### Check Network Requests

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Try to sign in
4. Look for requests to `identitytoolkit.googleapis.com` or `securetoken.googleapis.com`
5. Check if they show:
   - ✅ Green (200 status) = Working
   - ❌ Red/Failed = Network blocked or timeout
   - ⚠️ Pending/Slow = Network is slow

## Testing the Fix

### On Local Development
```bash
cd /home/austineske/Desktop/fashion-fusion-shop/src/frontend-service
npm run dev
# Open http://localhost:5173
# Try signing in and check console for detailed logging
```

### After Deployment
1. Open the live app URL
2. Open DevTools Console
3. Try to sign in
4. Watch for retry attempts and final success/failure
5. Check if helpful error message appears instead of just "Error code: 9"

## If Problem Persists

1. **Document the exact error message** shown in the browser
2. **Note your network environment**:
   - Are you on WiFi or wired?
   - Corporate network?
   - VPN enabled?
   - Any proxy?
3. **Open Browser DevTools** → Network tab → Look for failed requests
4. **Share the following information**:
   - Screenshot of Console tab
   - Screenshot of Network tab (especially failed requests)
   - Your network setup description
   - Browser and OS version

## Related Resources

- [Firebase Error Codes](https://firebase.google.com/docs/reference/js/auth.errors)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Troubleshooting](https://firebase.google.com/docs/web/learn-more)
- [Google APIs Status](https://status.cloud.google.com/)

## Summary of Changes Made

### Files Modified:
1. **`src/frontend-service/components/auth-service.js`**
   - Added `retryOperation()` for automatic retries
   - Added `checkNetworkConnectivity()` for offline detection
   - Enhanced all auth functions with retry logic
   - Added detailed error messages

2. **`src/frontend-service/components/firebase-config.js`**
   - Added initialization logging
   - Added provider configuration logging
   - Helps diagnose if Firebase loads properly

### Key Features:
- ✅ Automatic retry up to 3 times for network failures
- ✅ Exponential backoff between retries (1s, 2s, 4s)
- ✅ Network connectivity detection
- ✅ Detailed console logging for debugging
- ✅ Better error messages for users
- ✅ No impact on other error types (validation, auth failures, etc.)

---

**Last Updated**: 2025-12-10
