class CommitsController < ApplicationController
  def create
    commit = Commit.new commitParams
    commit.save
    
    intIds = params["versionIds"].map(&:to_i)
    Version.where(id: intIds).update_all(stage: 3, commit_id: commit.id)
    versions = Version.where(id: intIds)
    byebug
    render json: { versions: versions.map { |version| version.document.name }, commit: commit.as_json(methods: :date_to_s) }
  end

  def remove_from_repository
    #find the last commit by how many step
    commits = Commit.where(repository_id: params["repository_id"]).last(params["step"])

    #find all the version of commits
    versions = []
    commits.each { |commit|
      versions += commit.versions.map { |version| version }
    }

    #find all the document and uniq
    documents = versions.map { |version| version.document }.uniq

    #find the document that has any version in stage 2, and the versions should be deleted
    documents_has_stage2 = documents.filter { |document|
      document.versions.any? { |version|
        version.stage == 2
      }
    }

    #find the document that doesn't has any version in stage 2
    documents_without_stage2 = documents - documents_has_stage2

    #version should be delete from documents has stage 2
    versions_should_delete = versions.filter { |version|
      documents_has_stage2.any? { |doc_has_stage2|
        doc_has_stage2.id == version.document_id
      }
    }

    #versions belongs_to documents without stage 2 take the last version to be update to stage 2 and remove the commit_id, other versions should be deleted
    versions_without_stage2 = versions - versions_should_delete
    version_should_delete_from_stage3 = []
    version_should_update_to_stage2 = documents_without_stage2.map { |doc_without_stage2|
      version_order_desc = versions_without_stage2.filter { |version| version.document_id == doc_without_stage2.id }.sort_by { |v| v.id }.reverse
      if version_order_desc.length > 1
        version_should_delete_from_stage3 += version_order_desc[1...version_order_desc.length]
      end
      version_order_desc.first
    }

    versions_should_delete += version_should_delete_from_stage3
    versions_should_delete_ids = versions_should_delete.map { |version| version.id }
    version_should_update_to_stage2_ids = version_should_update_to_stage2.map { |version| version.id }

    if versions_should_delete_ids.length > 0
      Version.where(id: versions_should_delete_ids).destroy_all()
    end

    if version_should_update_to_stage2_ids.length > 0
      Version.where(id: version_should_update_to_stage2_ids).update_all(stage: 2, commit_id: nil)
    end

    updated_version = Version.where(id: version_should_update_to_stage2_ids).order("document_id")
    deleted_commit_ids = commits.map { |commit| commit.id }

    Commit.where(id: deleted_commit_ids).destroy_all()

    # byebug
    render json: { move_to_staging: updated_version.as_json(include: [:document]), commit_ids: deleted_commit_ids }
  end

  private

  def commitParams
    params.require(:commit).permit(:commit_message, :date_time, :repository_id)
  end
end
