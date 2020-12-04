class Visualize {
    constructor(url) {
        this.url = url
        this.createDocument();
        this.getData(`${this.url}/repositories`, this.renderOptions);
        this.selectEvent();
        this.closeError.addEventListener('click', () => this.fileError.style.display = 'none');
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
            const name = event.target.fileName.value;
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
                .catch(() => {
                    this.fileError.style.display = "inline-block";
                    setTimeout(() => this.fileError.style.display = 'none', 5000);
                })
        });
    }

    createRepo() {
        this.repoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const data = {
                name: event.target.name.value
            }
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
                    this.repoErr.style.display = "inline-block";
                    setTimeout(() => this.repoErr.style.display = 'none', 5000);
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
                        break;
                    case 2:
                        list = this.stagingArea;
                        break;
                    case 3:
                        list = this.repoArea;
                        const commits = this.commitMessageHandler(object.versions, list);
                        console.log(json);
                        list.append(commits[version.commit_id].elm);
                        this.createListItem(object.name, version.id, commits[version.commit_id].elm);
                        break;
                }
                // this.createListItem(object.name, version.id, list);
            });
        });
    }

    repoAreaList(commitMessage, commitDate) {
        let divItem = document.createElement("div");
        divItem.className = "item";
        divItem.innerHTML = "<i class='large circle outline icon'></i>";
        let divContent = document.createElement("div");
        divContent.className = "content";
        divContent.innerHTML = `
        <a class="header">${commitMessage}</a>
        <div class="description">${commitDate}</div>
        `;
        divItem.append(divContent);
        return divItem;
    }

    commitMessageHandler(objVers, listItem) {
        const commits = {};
        objVers.forEach(version => {
            const message = version.commit.commit_message;
            const date = version.commit.date_time;
            if (!commits[version.commit_id]) {
                const elm = this.repoAreaList(message, date, listItem);
                commits[version.commit_id] = { message: message, elm };
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