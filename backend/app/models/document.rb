class Document < ApplicationRecord
    belongs_to :repository
    has_many :versions
    validates :name, :uniqueness => {:scope => :repository_id}

    def createVersion
        Version.find_or_initialize_by stage: 1, document_id: self.id
    end
end