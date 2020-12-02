class CreateVersions < ActiveRecord::Migration[6.0]
  def change
    create_table :versions do |t|
      t.string :content
      t.integer :stage
      t.integer :commit_id
      t.integer :document_id
      t.timestamps
    end
  end
end
