require "net/http"

class TmdbSearchesController < ApplicationController
  def search
    query = params[:query].to_s.strip
    return render(json: {results: [], total_pages: 0}) if query.blank?

    uri = URI("https://api.themoviedb.org/3/search/movie")
    uri.query = URI.encode_www_form(
      api_key: TMDB.api_key,
      query: query,
      language: "en-US",
      page: params[:page] || 1
    )

    response = Net::HTTP.get_response(uri)
    json = JSON.parse(response.body)

    render json: json
  rescue => _
    render json: {results: [], error: "TMDB unavailable"}, status: :bad_gateway
  end
end
