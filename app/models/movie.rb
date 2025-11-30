class Movie < ApplicationRecord
  has_many :bookmarks

  validates :title, presence: true
  validates :overview, presence: true
  validates :tmdb_id, uniqueness: true, allow_nil: true
end
