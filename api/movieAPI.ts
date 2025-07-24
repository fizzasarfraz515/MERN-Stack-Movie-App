const API_KEY = '219d2326';

export const fetchMovies = async (query: string) => {
  const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
  const data = await response.json();
  return data.Search || [];
};

export const fetchMovieDetails = async (id: string) => {
  const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
  const data = await response.json();
  return data;
};
