class Commit < ApplicationRecord
    has_many :versions
    validates :commit_message, presence: true
end
