class RepositorySerializer
  include FastJsonapi::ObjectSerializer
  attributes :name, :branch
  has_many :documents
end
