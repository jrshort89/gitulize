class Commit < ApplicationRecord
  has_many :versions
  belongs_to :repository
  validates :commit_message, presence: true

  def date_to_s
    self.date_time.in_time_zone("Eastern Time (US & Canada)").strftime("%b %d, %Y %I:%M %p")
  end
end
