import React, { useState } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Card, CardContent, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const SearchResultsApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, { searchQuery });
      setSearchResults(response.data);
    } catch (err) {
      setError('An error occurred while fetching search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToExcel = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/excel`, { results: searchResults }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'GoogleSearchResults.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('An error occurred while generating the Excel file.');
    }
  };

  const handleSendEmail = async () => {
    try {
      await axios.post(`${API_BASE_URL}/email`, { results: searchResults, recipientEmail, searchQuery });
      alert('Email sent successfully.');
    } catch (err) {
      setError('An error occurred while sending the email.');
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Google Search Results App
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <TextField
              label="Enter search query"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}
          {searchResults.length > 0 && (
            <>
              <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSaveToExcel}
                  startIcon={<SaveIcon />}
                >
                  Save to Excel
                </Button>
                <TextField
                  label="Recipient Email"
                  variant="outlined"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  sx={{ flexGrow: 1, minWidth: '200px' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendEmail}
                  startIcon={<EmailIcon />}
                >
                  Send Email
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Link</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Snippet</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((result, index) => (
                      <TableRow 
                        key={index}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                      >
                        <TableCell>{result.title}</TableCell>
                        <TableCell>
                          <a href={result.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                            {result.link}
                          </a>
                        </TableCell>
                        <TableCell>{result.snippet}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SearchResultsApp;
