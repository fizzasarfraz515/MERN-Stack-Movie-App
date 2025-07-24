import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

interface MovieCardProps {
  title: string;
  year: string;
  poster: string;
  imdbID: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ title, year, poster }) => {
  return (
    <Card>
      <CardMedia component="img" height="350" image={poster} alt={title} />
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{year}</Typography>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
