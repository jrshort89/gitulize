class VersionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :content, :stage, :commit_id
  belongs_to :document
  
end
