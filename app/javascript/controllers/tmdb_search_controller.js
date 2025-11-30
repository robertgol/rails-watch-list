import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="tmdb-search"
export default class extends Controller {
  static targets = ["input", "results", "movie", "submit"]

  connect() {
    this.timeout = null
    this.handleOutsideClick = (e) => {
      if (!this.element.contains(e.target)) {
        this.clearResults()
      }
    }
    document.addEventListener("click", this.handleOutsideClick)
  }

  disconnect() {
    document.removeEventListener("click", this.handleOutsideClick)
    clearTimeout(this.timeout)
  }

  debouncedSearch() {
    this.clearResults()
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.search(), 400)
  }

  async search() {
    const query = this.inputTarget.value.trim()
    // Hide dropdown if query is empty
    if (query.length === 0) {
      this.clearResults()
      return
    }

    try {
      const response = await fetch(`/tmdb/search?query=${encodeURIComponent(query)}`, {
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest" // optional, helps Rails respond_to
        }
      })

      if (!response.ok) throw new Error("Network error")

      const responseJson = await response.json()  // expecting array of movies
      const movies = responseJson.results
      this.showResults(movies)
    } catch (error) {
      console.error("TMDB search failed:", error)
      this.clearResults()
    }
  }

  clearResults() {
    this.resultsTarget.innerHTML = ""
    this.resultsTarget.style.display = "none"
  }

  showResults(movies) {
    movies.forEach(movie => {
      const item = document.createElement("a")
      item.className = "dropdown-item"
      item.dataset.action = "click->tmdb-search#select"
      item.dataset.movie = JSON.stringify(movie)
      const posterUrl = this.posterUrl(movie.poster_path)
      item.innerHTML = `
        <div class="d-flex">
          <img src="${posterUrl}" width="46" height="69" class="rounded me-3" alt="${movie.title}">
          <div>
            <div class="fw-semibold text-break">${movie.title}</div>
            <small class="text-muted">${movie.release_date?.substring(0,4) || "Unknown year"}</small>
          </div>
        </div>
      `
      this.resultsTarget.appendChild(item)
    });
    if (movies.length) {
      this.resultsTarget.style.display = "block"
    }
  }

  posterUrl(posterPath) {
    return posterPath
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : '/images/missing-poster.jpg';
  }

  async select(event) {
    event.preventDefault()
    this.clearResults()
    const movie = JSON.parse(event.currentTarget.dataset.movie)
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content

    // 1. Fallback poster if poster_path is missing or null
    const posterUrl = this.posterUrl(movie.poster_path)

    // 2. Fallback overview text
    const overview = movie.overview && movie.overview.trim() !== ''
      ? movie.overview
      : 'Missing overview';

    try {
      const response = await fetch('/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
          movie: {
            tmdb_id: movie.id,
            title: movie.title,
            overview: overview,
            poster_path: movie.poster_path,
            rating: movie.vote_average
          }
        })
      })

      if (!response.ok) throw new Error("Creation failed: " + await response.json().errors)

      const createdMovie = await response.json()
      this.movieTarget.innerHTML = `
        <div class="d-flex align-items-center mt-3">
          <img src="${posterUrl}" class="rounded me-3" width="46" height="69" alt=" $${createdMovie.title}">
          <div>
            <div class="fw-semibold">${createdMovie.title}</div>
            <input type="hidden" name="bookmark[movie_id]" value="${createdMovie.id}">
          </div>
        </div>
      `
      this.inputTarget.value = ''
      this.submitTarget.disabled = false
    } catch (error) {
      console.error("Movie creation failed:", error)
    }
  }
}
