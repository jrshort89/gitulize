Rails.application.routes.draw do
  get '/repositories/:id/documents', to: 'repositories#getDocuments'
  patch '/versions/bulk', to: 'versions#update_bulk'
  delete '/versions/bulk', to: 'versions#delete_bulk'

  # resources :versions
  resources :documents
  resources :commits
  resources :repositories

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
