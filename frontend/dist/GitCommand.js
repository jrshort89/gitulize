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

  gitCommandRunCallback(event) {
    event.preventDefault();
    const command = event.target.git_command.value;
    const command_split = command.split(" ");

    if (command_split[0] == "git" && command_split[1] == "add") {
      // git add change to stage 2
      this.gitAdd(command_split);
    } else if (command_split[0] == "git" && command_split[1] == "reset") {
      // git reset change to stage 1
      this.gitReset(command_split);
    } else if (command_split[0] == "git" && command_split[1] == "checkout") {
      // git checkout delete stage 1 version if have another stage
      this.gitCheckout(command_split);
    } else if (command_split[0] == "git" && command_split[1] == "commit") {
      // git commit  update to stage 3 and create a new commit
      // Jake
      this.gitCommit(command_split);
    }

    event.target.reset();
  }

  async gitAdd(command_split) {
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
  }

  async gitReset(command_split) {
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
  }

  async gitCheckout(command_split) {
    let workingDirList = [...this.workingDir.querySelectorAll(".item")];
    if (command_split[2] == ".") {
      const versionIds = workingDirList.map((list) => +list.dataset.versionId);
      const response = await this.deleteVerstionStage(versionIds);
      this.removeListsToOtherArea(workingDirList, response.ids);
    } else if (
      workingDirList.find((div) => div.dataset.fileName == command_split[2])
    ) {
      const fileDiv = workingDirList.find(
        (div) => div.dataset.fileName == command_split[2]
      );
      const versionId = [+fileDiv.dataset.versionId];
      workingDirList = [fileDiv];
      await this.deleteVerstionStage(versionId, 1);
      this.removeListsToOtherArea(workingDirList);
    }
  }

  async gitCommit(command_split) {
    //jake
    const childArray = Array.from(this.stagingArea.childNodes);
    const versionIds = childArray.map(elm => elm.dataset.versionId);
    const commitData = {
        versionIds: versionIds,
        commit_message: command_split[3].replace(/['"]/g, ''),
        date_time: new Date
    };
    const response = await fetch("http://localhost:3000/commits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commitData)
    })
    const json = response.json();
}

  updateVerstionStage(versionIds, stage) {
    const requestURL = "http://localhost:3000/versions/bulk";
    const data = {
      versionIds: versionIds,
      stage: stage,
    };
    const requestObj = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
      div.remove();
    });
  }

  deleteVerstionStage(versionIds) {
    const requestURL = "http://localhost:3000/versions/bulk";
    const data = {
      versionIds: versionIds,
    };
    const requestObj = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    return fetch(requestURL, requestObj).then((res) => res.json());
  }

  removeListsToOtherArea(list, ids) {
    let deletedList = list.filter(function (div) {
      return ids.includes(+div.dataset.versionId);
    });
    deletedList.forEach((div) => div.remove());
  }
}
