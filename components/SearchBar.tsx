import { TextField } from '@mui/material';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <TextField
    label="Search Movies"
    variant="outlined"
    fullWidth
    margin="normal"
    value={value}
    onChange={onChange}
  />
);

export default SearchBar;
