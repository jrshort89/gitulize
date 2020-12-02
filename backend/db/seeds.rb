# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Repository.destroy_all
Document.destroy_all
Version.destroy_all

repo = Repository.find_or_create_by(name: "jake-repo", branch: "master")

documentJS = Document.find_or_create_by(name: "script.js", repository_id: repo.id, user_id: nil)
documentAdapterJS = Document.find_or_create_by(name: "adapter.js", repository_id: repo.id, user_id: nil)
documentHTML = Document.find_or_create_by(name: "index.html", repository_id: repo.id, user_id: nil)
documentCSS = Document.find_or_create_by(name: "style.css", repository_id: repo.id, user_id: nil)

versionJS1 = Version.find_or_create_by(content: "content script.js", stage: "1", document_id: documentJS.id, commit_id: nil)
versionAdapterJS1 = Version.find_or_create_by(content: "content adapter.js", stage: "1", document_id: documentAdapterJS.id, commit_id: nil)

versionHTML2 = Version.find_or_create_by(content: "content index.html", stage: "2", document_id: documentHTML.id, commit_id: nil)

versionCSS3 = Version.find_or_create_by(content: "content style.css", stage: "3", document_id: documentCSS.id, commit_id: nil)