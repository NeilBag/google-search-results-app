# Automated Google Search Web App

This web application automates Google searches and sends the results via email. It's built using Node.js, and Express, and uses Puppeteer for web scraping.

## Features

- Perform automated Google searches
- Scrape search results
- Send search results via email
- User-friendly web interface
- download search results on an Excel

## Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)
- Google Chrome or Chromium browser

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/automated-google-search-webapp.git
   cd automated-google-search-webapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the credentials in `server.js`:
   - Open `server.js` in a text editor
   - Locate the following section:
     ```javascript
     const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: 'your-email@gmail.com',
         pass: 'your-app-password'
       }
     });
     ```
   - Replace `'your-email@gmail.com'` with your Gmail address
   - Replace `'your-app-password'` with your Gmail app password (see instructions below)

## Generating an App Password for Gmail

To use Gmail for sending emails, you need to generate an app password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security" from the left sidebar
3. Under "Signing in to Google," select "2-Step Verification" and turn it on if not already enabled
4. Go back to the Security page and select "App passwords"
5. Choose "Mail" as the app and "Other" as the device
6. Enter a name for the app password (e.g., "Automated Google Search App")
7. Click "Generate"
8. Use the generated 16-character password in your `server.js` file

## Running the Project

1. Start the server:
   ```
   node server.js
   ```

2. Open a web browser and navigate to `http://localhost:3000`

3. Use the web interface to enter your search query and email address

4. Click "Submit" to start the automated search process

5. Check your email for the search results

## Troubleshooting

- If you encounter issues with Puppeteer, ensure that you have Google Chrome or Chromium installed on your system
- Make sure your Gmail account settings allow access from less secure apps or use an app-specific password

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
