import { HttpClient } from '@angular/common/http';
import { inject, Injectable , signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Movie } from '../interfaces/movie';
import { MovieResponse } from '../interfaces/movie-response';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';

@Injectable({
    providedIn: 'root'
})
export class MovieService {

    private readonly http= inject(HttpClient)
    private readonly url = environment.url_api
    private readonly key = environment.api_key
    private readonly movieUrl = environment.url_movie_api

    public movieList=signal<Movie[]>([]);
    public selectedMovie=signal< Movie | null>(null);
    public wishList=signal<Movie[]>(this.loadWishList());
    getMovieList(): Observable<Movie[]> {
        return this.http
        .get<MovieResponse>(`${this.url}?api_key=${this.key}`)
        .pipe(
            map(response => response.results),
            shareReplay({bufferSize: 1, refCount: false})

        );
    }

    getMovieById(id: number) {
        return this.http.get<Movie>(`${this.movieUrl}${id}?api_key=${this.key}`)
        .pipe(
            map(response => response)
        )
    }
      private loadWishList(): Movie[] {
    try {
      const saved = localStorage.getItem('wishList');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
   }

   addToWishList(movie: Movie) {
    if (this.wishList().some(m => m.id === movie.id)) {
      return;
    }
    this.wishList.update(wishList => [...wishList, movie])
    localStorage.setItem('wishList', JSON.stringify(this.wishList()));
   }

   removeFromWishList(id: number) {
    this.wishList.update(wishList => wishList.filter(m => m.id !== id))
    localStorage.setItem('wishList', JSON.stringify(this.wishList()));
   }

}
