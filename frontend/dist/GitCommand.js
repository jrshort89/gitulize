class GitCommand {
  workingDir = document.getElementById("working-directory-area-list");
  stagingArea = document.getElementById("staging-area-list");
  repoArea = document.getElementById("repository-area-list");

  gitAddDotBtn = document.getElementById("git-add-dot");
  gitCommitBtn = document.getElementById("git-commit");
  gitResetSoftBtn = document.getElementById("git-reset-soft");
  gitResetDotBtn = document.getElementById("git-reset-dot");
  gitCheckoutDotBtn = document.getElementById("git-checkout-dot");

  constructor() {
    this.gitButtonSetup();
    this.gitCommandRunSetup();
  }

  gitButtonSetup() {
    this.gitAddDotBtn.addEventListener("click", (event) =>
      this.gitButtonCallBack(event)
    );
    this.gitCommitBtn.addEventListener("click", (event) =>
      this.gitButtonCallBack(event)
    );
    this.gitResetSoftBtn.addEventListener("click", (event) =>
      this.gitButtonCallBack(event)
    );
    this.gitResetDotBtn.addEventListener("click", (event) =>
      this.gitButtonCallBack(event)
    );
    this.gitCheckoutDotBtn.addEventListener("click", (event) =>
      this.gitButtonCallBack(event)
    );
  }

  gitButtonCallBack(event) {
    let gitCommand = document.getElementById("git-command");
    gitCommand.value = event.target.innerText;
    gitCommand.focus();
  }

  gitCommandRunSetup() {
    let gitCommandForm = document.getElementById("git-command-form");
    gitCommandForm.addEventListener("submit", (event) =>
      this.gitCommandRunCallback(event)
    );
  }

  async gitCommandRunCallback(event) {
    event.preventDefault();
    const command = event.target.git_command.value;
    const command_split = command.split(" ");
    //git add change to stage 2
    if (command_split[0] == "git" && command_split[1] == "add") {
      let workingDirList = [...this.workingDir.querySelectorAll(".item")];
      const stagingList = this.stagingArea;
      if (command_split[2] == "." && workingDirList.length > 0) {
        const versionIds = workingDirList.map((list) => +list.dataset.versionId);
        await this.updateVerstionStage(versionIds, 2);
        this.moveListsToOtherArea(workingDirList, stagingList);
      } else if (
        workingDirList.find((div) => div.dataset.fileName == command_split[2])
      ) {
        const fileDiv = workingDirList.find(
          (div) => div.dataset.fileName == command_split[2]
        );
        const versionId = [+fileDiv.dataset.versionId];
        workingDirList = [fileDiv];
        await this.updateVerstionStage(versionId, 2);
        this.moveListsToOtherArea(workingDirList, stagingList);
      }
      // git reset change to stage 1
    } else if (command_split[0] == "git" && command_split[1] == "reset") {
      let stagingList = [...this.stagingArea.querySelectorAll(".item")];
      let workingDirList = this.workingDir;
      if (command_split[2] == ".") {
        const versionIds = stagingList.map((list) => +list.dataset.versionId);
        await this.updateVerstionStage(versionIds, 1);
        this.moveListsToOtherArea(stagingList, workingDirList);
      } else if (
        stagingList.find((div) => div.dataset.fileName == command_split[2])
      ) {
        const fileDiv = stagingList.find(
          (div) => div.dataset.fileName == command_split[2]
        );
        const versionId = [+fileDiv.dataset.versionId];
        stagingList = [fileDiv];
        await this.updateVerstionStage(versionId, 1);
        this.moveListsToOtherArea(stagingList, workingDirList);
      }
      // git checkout
    } else if (command_split[0] == "git" && command_split[1] == "checkout") {
      let workingDirList = [...this.workingDir.querySelectorAll(".item")];
      if (command_split[2] == ".") {
        const versionIds = workingDirList.map((list) => list.dataset.versionId);
        await this.deleteVerstionStage(versionIds);
        this.removeListsToOtherArea(workingDirList);
      } else if (
        workingDirList.find((div) => div.dataset.fileName == command_split[2])
      ) {
        const fileDiv = workingDirList.find(
          (div) => div.dataset.fileName == command_split[2]
        );
        const versionId = fileDiv.dataset.versionId;
        workingDirList = [fileDiv];
        await this.deleteVerstionStage(versionId, 1);
        this.removeListsToOtherArea(workingDirList);
      }
    }

    event.target.reset();
  }

  updateVerstionStage(versionIds, stage) {
    const requestURL = "http://localhost:3000/versions/bulk";
    const data = {
      versionIds: versionIds,
      stage: stage,
    };
    const requestObj = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    return fetch(requestURL, requestObj);
  }

  moveListsToOtherArea(fromList, toList) {
    const list = [...toList.children];
    let listShouldMove = [];
    let listShouldRemove = [];
    fromList.forEach(function (fromItem) {
      const isFound = list.find(
        (l) => l.dataset.fileName == fromItem.dataset.fileName
      );
      if (isFound) listShouldRemove.push(fromItem);
      else listShouldMove.push(fromItem);
    });

    listShouldMove.forEach(function (div) {
      toList.appendChild(div);
    });

    listShouldRemove.forEach(function (div) {
      div.remove()
    });
  }

  deleteVerstionStage(versionIds) {
    const requestURL = "http://localhost:3000/versions/bulk";
    const data = {
      versionIds: versionIds,
    };
    const requestObj = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    return fetch(requestURL, requestObj);
  }

  removeListsToOtherArea(list) {
    list.forEach(function (div) {
      div.remove();
    });
  }
}
