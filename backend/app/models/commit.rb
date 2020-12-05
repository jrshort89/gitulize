class Commit < ApplicationRecord
    has_many :versions
    belongs_to :repository
    validates :commit_message, presence: true
end
