class Visualize {
    constructor(url) {
        this.url = url
        this.createDocument();
        this.getData(`${this.url}/repositories`, this.renderOptions);
        this.selectEvent();
        this.repoButton.addEventListener('click', () => this.repoDiv.classList.toggle('repo-div'));
        this.createRepo();
    }

    workingDir = document.getElementById("working-directory-area-list");
    stagingArea = document.getElementById("staging-area-list");
    repoArea = document.getElementById("repository-area-list");
    repoList = document.getElementById("repo-options");
    repoButton = document.getElementById("new-repo-button");
    repoForm = document.getElementById("new-repo");
    repoDiv = document.getElementById("repo-div");

    fileError = document.getElementById("file-error");
    closeError = document.getElementById("close-error");
    repoErr = document.getElementById('repo-error');

    fileForm = document.getElementById('doc-form');

    getData(url, method) {
        fetch(url)
            .then(res => res.json())
            .then(json => method(json));
    }

    renderOptions(elements) {
        const repoList = document.getElementById('repo-options');
        elements.data.forEach(elm => {
            const option = document.createElement('option');
            option.textContent = elm.attributes.name;
            option.value = elm.id;
            repoList.append(option);
        })
    }

    selectEvent() {
        document.getElementById("repo-options").addEventListener('change', (event) => {
            event.preventDefault();
            this.clearList();
            this.renderGitLists(this.repoList.value)
        });
    }

    clearList() {
        this.workingDir.innerHTML = '';
        this.stagingArea.innerHTML = '';
        this.repoArea.innerHTML = '';
    }

    createDocument() {
        this.fileForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = event.target.fileName.value.replace(' ', '');
            const repoId = document.getElementById("repo-options").value;
            const data = {
                name: name,
                repository_id: repoId
            }
            fetch(`${this.url}/documents`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then((version) => {
                    this.fileForm.reset();
                    this.createListItem(name, version.id, this.workingDir)
                })
                .catch((err) => {
                    this.fileError.classList.toggle('file-error');
                    setTimeout(() => this.fileError.classList.toggle('file-error'), 5000);
                })
        });
    }

    createRepo() {
        this.repoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = {
                name: event.target.name.value
            }
            if (data.name === '') throw (alert('Blank repository name not allowed!'));
            fetch(`${this.url}/repositories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(data => {
                    const repoList = document.getElementById('repo-options');
                    const option = document.createElement('option');
                    option.textContent = data.name;
                    option.value = data.id;
                    repoList.append(option);
                    this.repoDiv.classList.toggle('repo-div');
                    repoList.value = data.id;
                    this.clearList();
                    this.repoForm.reset();
                })
                .catch(err => {
                    this.repoErr.classList.toggle('repo-error');
                    setTimeout(() => this.repoErr.classList.toggle('repo-error'), 5000);
                })
        });
    }

    renderGitLists(id) {
        fetch(`${this.url}/repositories/${id}/documents`)
            .then(res => res.json())
            .then(data => this.createListItems(data))
    }

    createListItems(json) {
        const listsCreated = {};
        json.forEach(object => {
            object.versions.forEach(version => {
                let list;
                switch (version.stage) {
                    case 1:
                        list = this.workingDir;
                        this.createListItem(object.name, version.id, list);
                        break;
                    case 2:
                        list = this.stagingArea;
                        this.createListItem(object.name, version.id, list);
                        break;
                    case 3:
                        list = this.repoArea;
                        const commits = this.commitMessageHandler(object.versions, list);
                        if (!listsCreated[`commit${version.commit_id}`]) {
                            list.append(commits[`commit${version.commit_id}`].elm);
                            listsCreated[`commit${version.commit_id}`] = document.getElementById(`commit${version.commit_id}`);
                            this.commitFileHandler(object.name, version.id, listsCreated[`commit${version.commit_id}`]);
                        } else {
                            this.commitFileHandler(object.name, version.id, listsCreated[`commit${version.commit_id}`]);
                        }
                        break;
                }
            });
        });
    }

    repoAreaList(commitMessage, commitDate, commitId) {
        let divItem = document.createElement("div");
        divItem.dataset.id = commitId; //commit12
        divItem.className = "item";
        divItem.innerHTML = "<i class='large circle outline icon'></i>";
        let divContent = document.createElement("div");
        divContent.id = `commit${commitId}`;
        divContent.className = "content";
        divContent.innerHTML = `
        <a class="header">${commitMessage}</a>
        <div class="description">${commitDate}</div>
        `;
        divItem.append(divContent);
        return divItem;
    }

    commitFileHandler(fileName, versionId, folder) {
        let divList = document.createElement("div");
        divList.className = "list";
        divList.innerHTML = `
            <div class="item" id="${versionId}">
                <i class="file alternate middle aligned icon"></i>
                <div class="content">
                    <div class="header">${fileName}</div>
                </div>
            </div>
            `;
        folder.append(divList);
    }

    commitMessageHandler(objVers) {
        const commits = {};
        objVers.forEach(version => {
            if (version.stage === 3) {
                const message = version.commit.commit_message;
                const date = version.commit.date_to_s;
                if (!commits[`commit${version.commit_id}`]) {
                    const elm = this.repoAreaList(message, date, version.commit_id);
                    commits[`commit${version.commit_id}`] = { message: message, elm };
                }
            }
        })
        return commits;
    }

    createListItem(text, versionId, list) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.dataset.fileName = text;
        itemDiv.dataset.versionId = versionId;
        const fileI = document.createElement('i');
        fileI.className += 'large file alternate middle aligned icon';
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
        const contentLink = document.createElement('a');
        contentLink.classList.add('header');
        contentLink.textContent = text;
        contentDiv.append(contentLink);
        itemDiv.append(fileI, contentDiv);
        list.append(itemDiv);
    }
}