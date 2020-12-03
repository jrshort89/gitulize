class DocumentSerializer
  include FastJsonapi::ObjectSerializer
  attributes :name
  belongs_to :repository
  has_many :versions
end
