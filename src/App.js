// node node_modules/react-scripts/bin/react-scripts.js start

import { useEffect, useState } from 'react';
import WatchedSummary from './WatchedSummary';
import WatchedMovieList from './WatchedMovieList';
import MovieDetails from './MovieDetails';
import MovieList from './MovieList';
import Box from './Box';
import Main from './Main';
import NumResults from './NumResults';
import Search from './Search';
import NavBar from './NavBar';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import { KEY } from './KEY';

export default function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(() => {
    const saved = localStorage.getItem('userWatchedList');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  console.log(watched);

  // useEffect(function () {
  //   console.log('A');
  // }, []);

  // useEffect(function () {
  //   console.log('B');
  // });

  // console.log('C');

  useEffect(
    function () {
      localStorage.setItem('userWatchedList', JSON.stringify(watched));
    },
    [watched]
  );

  function handleSelectMovie(id) {
    setSelectedId(selectedId => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    console.log(movie);
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    console.log(watched, id);
    setWatched(watched => watched.filter(movie => movie.imbdID !== id));
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error('Something went wrong with fetching movies');

          const data = await res.json();
          if (data.Response === 'False') throw new Error('Movie not found');
          setMovies(data.Search);
          setError('');
        } catch (err) {
          if (err.name !== 'AbortError') {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError('');
        return;
      }

      handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          }
        /> */}
        <Box className="box-results">
          {!isLoading && !error && movies.length === 0 && (
            <p className="initial-txt">
              Keep track of every movie you watch, all in one place. Search,
              rate, and log your favorite films effortlessly — build your
              personal movie diary and never forget a flick again.
              <br />
              <strong>Start searching now!</strong>
            </p>
          )}
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
