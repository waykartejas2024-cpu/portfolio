OTP demo server and frontend

What I added
- `server.js` - Express server that serves static files and provides `/api/send-otp` and `/api/verify-otp`.
- `package.json` - dependencies and start script.
- `.env.example` - example env variables for Twilio.

How it works
- Start the server and open the frontend at: http://localhost:3000/portfolio/otp.html
- Enter a phone number (or any string) and click Generate. If Twilio is configured the server will attempt to send an SMS using the `TWILIO_FROM` number. If Twilio is not configured the server will return the OTP in the JSON response ( demo mode ).

Run locally
1. Open a terminal in `c:\Users\Lenovo\Desktop\project`.
2. Install dependencies:

```powershell
npm install
```

3. (Optional) Create a `.env` based on `.env.example` and set Twilio environment variables if you want real SMS.
4. Start the server:

```powershell
npm start
```

5. Open http://localhost:3000/portfolio/otp.html in your browser.

Security note
- This demo uses an in-memory store and is not production-ready. For a real system you should implement a persistent store, rate-limits, strong verification, and never return OTPs in API responses.
