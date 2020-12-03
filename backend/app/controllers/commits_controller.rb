class CommitsController < ApplicationController
    def create
        commit = Commit.new commitParams
        commit.save
        intIds = params["versionIds"].map(&:to_i)
        Version.where(id: intIds).update_all(stage: 3, commit_id: 1)
        versions = Version.where(id: intIds)
        render json: versions, commit.commit_message
    end

    private

    def commitParams
        params.require(:commit).permit(:commit_message, :date_time)
    end
end
