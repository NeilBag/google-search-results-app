const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'bagchineil518@gmail.com',
    pass: 'vyyq qbgl ckat gttp',
  },
};

async function fetchSearchResults(searchQuery) {
  const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=500`;
  let searchResults = [];

  async function fetchPage(url) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const $ = cheerio.load(data);
      $('.tF2Cxc').each((i, elem) => {
        const title = $(elem).find('h3').text();
        const link = $(elem).find('.yuRUbf a').attr('href');
        const snippet = $(elem).find('.IsZvec').text();
        searchResults.push({ title, link, snippet });
      });
      const nextPageLink = $('#pnnext').attr('href');
      if (nextPageLink) {
        const nextPageURL = `https://www.google.com${nextPageLink}`;
        await fetchPage(nextPageURL);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }

  await fetchPage(googleSearchURL);
  return searchResults;
}

function saveResultsToExcel(results) {
  const worksheetData = [
    ['Title', 'Link', 'Snippet'],
    ...results.map(result => [result.title, result.link, result.snippet]),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  const sheetStyle = {
    font: { name: 'Arial', sz: 10, bold: true },
    fill: { fgColor: { rgb: 'FFFF00' } },
  };
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
    if (cell) cell.s = sheetStyle;
  }
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

async function sendEmail(results, recipientEmail, searchQuery) {
  const transporter = nodemailer.createTransport(emailConfig);
  const htmlTable = `
    <table border="1">
      <thead>
        <tr>
          <th>Title</th>
          <th>Link</th>
          <th>Snippet</th>
        </tr>
      </thead>
      <tbody>
        ${results
          .map(
            (result) => `
          <tr>
            <td>${result.title}</td>
            <td><a href="${result.link}">${result.link}</a></td>
            <td>${result.snippet}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
  const excelBuffer = saveResultsToExcel(results);
  const mailOptions = {
    from: emailConfig.auth.user,
    to: recipientEmail,
    subject: `Google Search Results for: ${searchQuery}`,
    html: htmlTable,
    attachments: [
      {
        filename: 'GoogleSearchResults.xlsx',
        content: excelBuffer,
      },
    ],
  };
  await transporter.sendMail(mailOptions);
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API routes
app.post('/api/search', async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const results = await fetchSearchResults(searchQuery);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching search results.' });
  }
});

app.post('/api/excel', (req, res) => {
  try {
    const { results } = req.body;
    const excelBuffer = saveResultsToExcel(results);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=GoogleSearchResults.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while generating the Excel file.' });
  }
});

app.post('/api/email', async (req, res) => {
  try {
    const { results, recipientEmail, searchQuery } = req.body;
    await sendEmail(results, recipientEmail, searchQuery);
    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while sending the email.' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
