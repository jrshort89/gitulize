class CreateCommits < ActiveRecord::Migration[6.0]
  def change
    create_table :commits do |t|
      t.string :commit_message
      t.datetime :date_time

      t.timestamps
    end
  end
end
