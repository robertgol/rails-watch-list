module TMDB
  def self.api_key
    ENV.fetch("TMDB_API_KEY")
  end

  def self.read_access_token
    ENV.fetch("TMDB_READ_ACCESS_TOKEN", "")
  end
end
