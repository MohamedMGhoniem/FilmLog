import { useState, useEffect } from 'react';
import { KEY } from './KEY';
import Loader from './Loader';
import StarRating from './StarRating';

/*{Title: 'Terminator 2: Judgment Day', Year: '1991', Rated: 'R', Released: '03 Jul 1991', Runtime: '137 min', …}
Actors: 
"Arnold Schwarzenegger, Linda Hamilton, Edward Furlong"
Awards: "Won 4 Oscars. 39 wins & 33 nominations total"
BoxOffice: "$205,881,154"
Country: "United States, France"
DVD: "N/A"
Director: "James Cameron"
Genre: "Action, Adventure, Sci-Fi"
Language: "English, Spanish"
Metascore: "75"
Plot: "Over 10 years have passed since the first machine called The Terminator tried to kill Sarah Connor and her unborn son, John. The man who will become the future leader of the human resistance against the Machines is now a healthy young boy. However, another Terminator, called the T-1000, is sent back through time by the supercomputer Skynet. This new Terminator is more advanced and more powerful than its predecessor and its mission is to kill John Connor when he's still a child. However, Sarah and John do not have to face the threat of the T-1000 alone. Another Terminator (identical to the same model that tried and failed to kill Sarah Connor in 1984) is also sent back through time to protect them. Now, the battle for tomorrow has begun."
Poster: "https://m.media-amazon.com/images/M/MV5BNGMyMGNkMDUtMjc2Ni00NWFlLTgyODEtZTY2MzBiZTg0OWZiXkEyXkFqcGc@._V1_SX300.jpg"
Production: "N/A"
Rated: "R"
Ratings: (3) [{…}, {…}, {…}]
Released: "03 Jul 1991"
Response: "True"
Runtime: "137 min"
Title: "Terminator 2: Judgment Day"
Type: "movie"
Website: "N/A"
Writer: "James Cameron, William Wisher"
Year: "1991"
imdbID: "tt0103064"
imdbRating: "8.6"
imdbVotes: "1,227,716" */

export default function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const isWatched = watched.map(movie => movie.imbdID).includes(selectedId);

  const watchedUserRating = watched.find(
    movie => movie.imbdID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    Awards: awards,
    BoxOffice: boxOffice,
    Country: country,
    Writer: writer,
    imdbVotes,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imbdID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Escape') {
          onCloseMovie();
        }
      }

      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}&plot=full`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = 'usePopcorn';
        // console.log(`clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header
            style={{
              backgroundImage: `linear-gradient(90deg,rgba(0, 0, 0, 0.7),rgba(0, 0, 0, 0.42)), url(${poster}) `,
            }}
          >
            <button className="btn-back" onClick={onCloseMovie}>
              ⬅
            </button>
            <img src={poster} alt={`Poster of ${movie} move`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {' '}
                🗓 {released} &bull; ⏲ {runtime}
              </p>
              <p className="genre-container">
                {genre?.split(', ').map((el, i) => (
                  <span key={i} className="genre-title">
                    {el}
                  </span>
                ))}
              </p>
              <p>
                <span>⭐</span> {imdbRating} IMDB rating{' '}
                <small className="rate-num">({imdbVotes} votes)</small>
              </p>
              <p className="awards">
                <span>🏆:</span> {awards}
              </p>
              <p className="info">
                <span className="country">{country}</span>
                <span className="office">
                  💰: {boxOffice ? boxOffice : 'N/A'}
                </span>
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      {' '}
                      + Add to list
                    </button>
                  )}{' '}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>
              <strong>Starring:</strong> {actors}
            </p>
            <p>
              <strong>Directed by:</strong> {director}
            </p>
            <p>
              <strong>Written by:</strong> {writer}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
