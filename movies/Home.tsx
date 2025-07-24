import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Modal,
  IconButton,
  Container,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Poster: string;
  Plot?: string;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Avengers');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = '219d2326'; // ✅ Your OMDb API key

  const fetchMovies = async (title: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${title}`);
      if (res.data.Search) {
        setMovies(res.data.Search);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (id: string) => {
    try {
      const res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
      setSelectedMovie(res.data);
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  };

  useEffect(() => {
    fetchMovies(searchTerm);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchMovies(searchTerm);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" gap={2} mb={4}>
        <TextField
          fullWidth
          label="Search Movies"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton onClick={handleSearch} color="primary">
          <SearchIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
          {movies.map((movie) => (
            <Card
              key={movie.imdbID}
              sx={{ width: 200, cursor: 'pointer' }}
              onClick={() => fetchMovieDetails(movie.imdbID)}
            >
              <CardMedia
                component="img"
                image={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300'}
                alt={movie.Title}
                height="300"
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  {movie.Title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.Year}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Modal open={!!selectedMovie} onClose={() => setSelectedMovie(null)}>
        <Box sx={modalStyle}>
          {selectedMovie && (
            <>
              <Typography variant="h5" gutterBottom>
                {selectedMovie.Title}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {selectedMovie.Year}
              </Typography>
              <Typography variant="body2">{selectedMovie.Plot}</Typography>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default Home;
