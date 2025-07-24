import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';

interface MovieModalProps {
  open: boolean;
  onClose: () => void;
  movie: any;
}

const MovieModal = ({ open, onClose, movie }: MovieModalProps) => {
  if (!movie) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{movie.Title}</DialogTitle>
      <DialogContent>
        <img src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.jpg'} alt={movie.Title} width="100%" />
        <Typography variant="body1" mt={2}><strong>Year:</strong> {movie.Year}</Typography>
        <Typography variant="body1"><strong>Genre:</strong> {movie.Genre}</Typography>
        <Typography variant="body1"><strong>Plot:</strong> {movie.Plot}</Typography>
        <Typography variant="body1"><strong>Director:</strong> {movie.Director}</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;
