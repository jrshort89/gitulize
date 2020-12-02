class VersionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :content, :stage
  belongs_to :document
end
