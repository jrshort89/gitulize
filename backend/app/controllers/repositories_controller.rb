class RepositoriesController < ApplicationController

    @@options = {
        include: [:documents]
      }

    def index
        repos = Repository.all
        render json: RepositorySerializer.new(repos, @@options)
    end

    def show
        repo = Repository.find(params[:id])
        render json: repo
    end

    def getDocuments
        repo = Repository.find(params[:id]).documents
        commits = Commit.where(id: params[:id]).map {|com| com.versions}
        render json: repo.to_json(include: {versions: {include: :commit}}), commits
    end

    def create
        repo = Repository.find_or_initialize_by repo_params
        if !repo.id
            repo.save
            render json: repo.to_json
        end
    end

    private

    def repo_params
        params.require(:repository).permit(:name)
    end
end
