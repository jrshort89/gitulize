class CommitsController < ApplicationController
    def create
        commit = Commit.new commitParams
        commit.save
        intIds = params["versionIds"].map(&:to_i)
        Version.where(id: intIds).update_all(stage: 3, commit_id: commit.id)
        versions = Version.where(id: intIds)
        render json: {versions: versions.map{|version| version.document.name}, commit: commit}
    end

    private

    def commitParams
        params.require(:commit).permit(:commit_message, :date_time)
    end
end
