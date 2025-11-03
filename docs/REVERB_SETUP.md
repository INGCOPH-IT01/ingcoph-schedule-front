# Laravel Reverb Setup & Troubleshooting Guide

## Summary of Changes

I've fixed several configuration issues that were preventing Laravel Reverb from working properly:

### 1. Frontend Configuration Issues (FIXED)
- ❌ **Problem**: Hardcoded production values (`bschedule.m4d8q2.com:443`)
- ❌ **Problem**: Hardcoded auth endpoint (`http://192.168.10.57:8010`)
- ❌ **Problem**: No fallback configuration
- ✅ **Solution**: Updated `src/services/echo.js` with proper environment variable support and debugging logs

### 2. Configuration Mismatch (FIXED)
- ❌ **Problem**: Frontend trying to connect to HTTPS/443, backend running on HTTP/8080
- ✅ **Solution**: Added proper defaults matching backend configuration

### 3. Missing Environment File (ACTION REQUIRED)
- ❌ **Problem**: No `.env` file for frontend environment variables
- ⚠️ **Action Required**: You need to manually create this file (see below)

---

## Current Backend Configuration

Your Laravel backend is configured with:
- **Reverb Key**: `kx677b9udp95kpffwpcg`
- **App ID**: `460626`
- **Host**: `localhost`
- **Port**: `8080`
- **Scheme**: `http` (no TLS)
- **Queue**: `database` driver
- **Broadcast**: `reverb` driver

**Services Running**:
- ✅ Reverb server: `php artisan reverb:start` (PID: 2784)
- ✅ Queue worker: `php artisan queue:work` (PID: 2779)

---

## Required Setup Steps

### Step 1: Create Frontend Environment File

Create a `.env.local` or `.env` file in the frontend root directory:

```bash
cd /Users/karloalfonso/Documents/GitHub/schedule/ingcoph-schedule-front
```

Create the file with this content:

```env
# Laravel Echo / Reverb Configuration
# For local development

# Reverb App Credentials (must match backend)
VITE_REVERB_APP_KEY=kx677b9udp95kpffwpcg
VITE_REVERB_APP_ID=460626

# Local Development
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

# API Base URL
VITE_API_BASE_URL=http://localhost:8010
```

**For Production**, uncomment and update these values:
```env
VITE_REVERB_HOST=bschedule.m4d8q2.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
VITE_API_BASE_URL=https://bschedule.m4d8q2.com
```

### Step 2: Restart Frontend Dev Server

After creating the `.env` file:

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

Vite will automatically load the new environment variables.

### Step 3: Test the Connection

1. **Open Browser Console** (`F12`)
2. **Login to your application**
3. **Look for Echo initialization logs**:
   ```
   Initializing Echo with config: {
     broadcaster: 'reverb',
     key: 'kx677b9udp95kpffwpcg',
     wsHost: 'localhost',
     wsPort: 8080,
     forceTLS: false,
     authEndpoint: 'http://localhost:8010/api/broadcasting/auth'
   }
   ```
4. **Check for connection success**:
   ```
   ✅ Reverb: Connected successfully
   ```

---

## Debugging Connection Issues

### Issue 1: "Connection Refused" or "Cannot Connect"

**Symptoms**:
```
❌ Reverb: Connection error
WebSocket connection to 'ws://localhost:8080' failed
```

**Solution**:
1. Verify Reverb is running:
   ```bash
   ps aux | grep "artisan reverb"
   ```
2. If not running, start it:
   ```bash
   cd /Users/karloalfonso/Documents/GitHub/schedule/ingcoph-schedule-back
   php artisan reverb:start
   ```

### Issue 2: "401 Unauthorized" on Broadcasting Auth

**Symptoms**:
```
POST http://localhost:8010/api/broadcasting/auth 401
```

**Solution**:
1. Check if user is authenticated (token exists)
2. Verify token is valid:
   ```javascript
   console.log('Token:', localStorage.getItem('token'))
   ```
3. Check CORS settings (see Issue 3)

### Issue 3: CORS Errors

**Symptoms**:
```
Access to XMLHttpRequest at 'http://localhost:8010/api/broadcasting/auth'
from origin 'http://localhost:5555' has been blocked by CORS policy
```

**Solution**:
Check backend CORS configuration:
```bash
cd /Users/karloalfonso/Documents/GitHub/schedule/ingcoph-schedule-back
php artisan config:show cors
```

Ensure your frontend URL is allowed in `allowed_origins`.

### Issue 4: Events Not Broadcasting

**Symptoms**:
- No errors in console
- Connected successfully
- But events not received

**Solution**:
1. **Check Queue Worker**:
   ```bash
   ps aux | grep "queue:work"
   ```
   If not running:
   ```bash
   php artisan queue:work
   ```

2. **Check Failed Jobs**:
   ```bash
   php artisan queue:failed
   ```

3. **Test Broadcasting Manually**:
   ```bash
   php artisan tinker
   ```
   ```php
   $booking = App\Models\Booking::first();
   event(new App\Events\BookingCreated($booking));
   ```

4. **Enable Broadcasting Debug Logs** (backend `.env`):
   ```env
   BROADCAST_DRIVER=log
   ```
   Then check `storage/logs/laravel.log`

---

## Testing Reverb Connection

### Method 1: Browser Console

```javascript
// Check if Echo is initialized
window.echoInstance = getEcho()

// Listen to public channel
window.echoInstance.channel('bookings')
  .listen('.booking.created', (e) => {
    console.log('Booking created:', e)
  })

// Listen to private channel (replace USER_ID)
window.echoInstance.private('user.1')
  .listen('.booking.status.changed', (e) => {
    console.log('Booking status changed:', e)
  })
```

### Method 2: Create a Test Booking

1. Go to your booking page
2. Create a new booking
3. Watch browser console for real-time updates
4. Check if the booking appears immediately without page refresh

---

## Production Deployment Checklist

When deploying to production (`bschedule.m4d8q2.com`):

### Backend
1. Update `.env`:
   ```env
   BROADCAST_CONNECTION=reverb
   REVERB_HOST=bschedule.m4d8q2.com
   REVERB_PORT=443
   REVERB_SCHEME=https
   ```

2. Configure reverse proxy (Nginx/Apache) to forward WebSocket connections:
   ```nginx
   location /app {
       proxy_pass http://localhost:8080;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
   ```

3. Start Reverb with SSL (if needed):
   ```bash
   php artisan reverb:start --host=0.0.0.0 --port=8080
   ```

4. Keep services running (use supervisor or systemd):
   - `php artisan reverb:start`
   - `php artisan queue:work`

### Frontend
1. Update `.env.production` or `.env`:
   ```env
   VITE_REVERB_HOST=bschedule.m4d8q2.com
   VITE_REVERB_PORT=443
   VITE_REVERB_SCHEME=https
   VITE_API_BASE_URL=https://bschedule.m4d8q2.com
   ```

2. Build with production config:
   ```bash
   npm run build
   ```

---

## Monitoring Reverb

### Check Active Connections
```bash
# View Reverb logs
tail -f storage/logs/laravel.log | grep Reverb
```

### Check Queue Jobs
```bash
# Monitor queue in real-time
php artisan queue:listen --verbose
```

### Reverb Statistics
Check the Reverb server output for connection stats.

---

## Common Events in Your Application

Your app broadcasts these events:

1. **`booking.created`**
   - Channels: `user.{userId}`, `bookings`
   - Triggered: When a new booking is created
   - Payload: Booking details with user and court info

2. **`booking.status.changed`**
   - Channels: `user.{userId}`, `bookings`
   - Triggered: When booking status changes (pending → approved, etc.)
   - Payload: Booking details + old/new status

---

## Need More Help?

1. Check browser console for detailed connection logs
2. Check Laravel logs: `storage/logs/laravel.log`
3. Check Reverb server output in terminal
4. Verify all services are running (Reverb + Queue Worker)

---

## Files Modified

- ✅ `src/services/echo.js` - Updated with proper configuration and debugging
- ⚠️ `.env` or `.env.local` - **You need to create this file manually**

---

**Status**: Configuration is ready! Just create the `.env` file and restart your dev server.
