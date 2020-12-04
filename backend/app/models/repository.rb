class Repository < ApplicationRecord
    has_many :documents
    validates :name, presence: true, uniqueness: true
    # , :uniqueness => {:scope => :user_id}

    def commits
        
    end
end
