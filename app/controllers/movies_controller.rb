class MoviesController < ApplicationController
  def create
    movie_params = params.require(:movie).permit(:tmdb_id, :title, :overview, :poster_url, :rating)
    @movie = Movie.find_or_create_by(tmdb_id: movie_params[:tmdb_id]) do |m|
      m.title = movie_params[:title]
      m.overview = movie_params[:overview]
      m.poster_url = movie_params[:poster_url]
      m.rating = movie_params[:rating]
    end

    if @movie.save
      render json: {id: @movie.id, title: @movie.title}, status: :created
    else
      render json: {errors: @movie.errors.full_messages}, status: :unprocessable_content
    end
  end
end
