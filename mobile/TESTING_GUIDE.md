# Testing Guide for DigiVote Mobile App

## Prerequisites

1. **Backend Server Running**
   - Flask backend must be running on port 5000
   - Database must be set up and accessible

2. **Development Environment**
   - Node.js installed
   - Expo CLI installed (`npm install -g expo-cli`)
   - iOS Simulator (Mac) or Android Emulator, OR
   - Expo Go app on physical device

## Step 1: Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Start the Flask server
python server.py
```

The backend should be running on `http://localhost:5000`

## Step 2: Configure API URL for Your Testing Environment

### For iOS Simulator or Android Emulator:
The default configuration (`http://localhost:5000/api`) should work.

### For Physical Device:
You need to update the API URL to use your computer's local IP address.

1. **Find your computer's local IP:**
   - **Windows:** Open Command Prompt and run `ipconfig`
     - Look for "IPv4 Address" under your active network adapter
     - Example: `192.168.1.100`
   - **Mac/Linux:** Open Terminal and run `ifconfig` or `ip addr`
     - Look for "inet" address (usually starts with 192.168.x.x)

2. **Update the API configuration:**
   - Edit `mobile/src/config/api.ts`
   - Replace `localhost` with your IP address:
   ```typescript
   return 'http://192.168.1.100:5000/api'; // Replace with your IP
   ```

3. **For Android Emulator specifically:**
   - Use `http://10.0.2.2:5000/api` instead of `localhost`

## Step 3: Start the Mobile App

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies (if not already done)
npm install

# Start Expo development server
npm start
# or
npx expo start
```

## Step 4: Open the App

### Option A: Using Expo Go (Physical Device)
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal
3. The app will load on your device

### Option B: Using Simulator/Emulator
1. Press `i` for iOS Simulator (Mac only)
2. Press `a` for Android Emulator
3. The app will open in the simulator/emulator

## Step 5: Test the Authentication Flow

### Test Registration:
1. You should see the Login screen
2. Tap "Sign up here" to go to Register screen
3. Fill in the registration form:
   - First Name
   - Last Name
   - Email (use a valid email format)
   - Phone Number
   - Password (min 8 chars, must have uppercase, lowercase, and number)
   - Confirm Password
4. Tap "Sign Up"
5. You should be redirected to OTP Verification screen

### Test OTP Verification:
1. Check your email for the OTP code (if email service is configured)
2. Enter the 6-digit code
3. Tap "Verify"
4. You should be redirected to the Home screen

### Test Login:
1. Logout from the Home screen
2. On Login screen, enter your registered email and password
3. Tap "Sign In"
4. You should be redirected to Home screen

## Troubleshooting

### Issue: "Network Error" or "Connection Refused"
**Solution:**
- Make sure backend is running
- Check API URL in `mobile/src/config/api.ts`
- For physical device, ensure both device and computer are on the same WiFi network
- Check firewall settings (port 5000 should be accessible)

### Issue: "CORS Error"
**Solution:**
- Update `backend/.env` file:
  ```
  ALLOWED_ORIGINS=http://localhost:5173,exp://localhost:8081
  ```
- Restart the backend server

### Issue: "Cannot connect to API"
**Solution:**
- Verify backend is accessible by opening `http://localhost:5000/api/health` in browser
- For physical device, test with your IP: `http://YOUR_IP:5000/api/health`

### Issue: App crashes on startup
**Solution:**
- Check console for error messages
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`

### Issue: OTP not received
**Solution:**
- Check if email service is configured in backend
- Check backend logs for email sending errors
- Verify email configuration in `backend/.env`

## Testing Checklist

- [ ] Backend server is running
- [ ] API URL is configured correctly for your environment
- [ ] Mobile app starts without errors
- [ ] Login screen displays correctly
- [ ] Registration form works
- [ ] OTP verification screen displays
- [ ] Login works with registered credentials
- [ ] Home screen displays after authentication
- [ ] Logout works correctly

## Next Steps

After successful authentication testing:
1. Test student profile creation
2. Test voting functionality
3. Test candidate application
4. Test results viewing
5. Test admin features (if admin account)

## Notes

- The app uses AsyncStorage for local data persistence
- Authentication state persists across app restarts
- Make sure your backend CORS settings allow requests from Expo

