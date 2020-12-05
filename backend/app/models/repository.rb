class Repository < ApplicationRecord
    has_many :documents
    has_many :commits
    validates :name, presence: true, uniqueness: true
    # , :uniqueness => {:scope => :user_id}
end
