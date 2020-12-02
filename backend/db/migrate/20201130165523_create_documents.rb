class CreateDocuments < ActiveRecord::Migration[6.0]
  def change
    create_table :documents do |t|
      t.string :name
      t.integer :repository_id
      t.integer :user_id
      t.timestamps
    end
  end
end
