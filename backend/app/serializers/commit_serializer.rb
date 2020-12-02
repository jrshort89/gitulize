class CommitSerializer
  include FastJsonapi::ObjectSerializer
  attributes :commit_message
  has_many :documents
end
