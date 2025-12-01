class List < ApplicationRecord
  belongs_to :user

  has_many :bookmarks, dependent: :destroy
  has_many :movies, through: :bookmarks

  validates :name, presence: true, uniqueness: true, length: {maximum: 20}
end
