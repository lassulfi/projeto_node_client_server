class UserController {
    
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

        this.selectAll();
    }

    /**
     * Submit edited values from the form
     */
    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();
            
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];
            let oldUser = JSON.parse(tr.dataset.user);
            let updatedUser = Object.assign({}, oldUser, values);
            

            tr.dataset.user = JSON.stringify(updatedUser); 
            
            this.getPhoto(this.formUpdateEl).then(content => {
                if(!values.photo) {
                    updatedUser._photo = oldUser._photo
                } else {
                    updatedUser._photo = content;
                };

                let user = new User();
                user.loadFromJSON(updatedUser);
                user.save();

                this.updateTableRow(tr, user);
                this.updateCount();
                this.formUpdateEl.reset();
                btn.disabled = false;
            },e => {
                console.error(e);
            });
            this.showPanelCreate();
        });
    }

    /**
     * Update a table row
     * 
     * @param {*} tr 
     * @param {User} values 
     */
    updateTableRow(tr, values){
        tr.dataset.user = JSON.stringify(values);

        tr.innerHTML = 
                `<td>
                    <img src="${values.photo}" alt="User Image" class="img-circle img-sm">
                </td>
                <td>${values.name}</td>
                <td>${values.email}</td>
                <td>${(values.admin) ? "Sim": "Não"}</td>
                <td>${Utils.dateFormat(values.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                </td>`;

            this.addEventsToTableRow(tr);
    }

    /**
     * Submit user data.
     */
    onSubmit(){
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();
            
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;
            
            let values = this.getValues(this.formEl);
            if(values == null){
                return false;
            }
            
            values.photo = "";
            this.getPhoto(this.formEl).then(content => {
                values.photo = content;
                values.save();
                this.addLine(values);
                this.formEl.reset();
                btn.disabled = false;
            },e => {
                console.error(e);
            });
        });
    }

    /**
     * get the user photo from the form
     * 
     * @param {*} form 
     */
    getPhoto(form){
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            let elements = [...form.elements].filter(item => {
                return (item.name === "photo") ? item : null;
            });
            let file = elements[0].files[0];
            fileReader.onload = ()=>{
                resolve(fileReader.result);
            };
            fileReader.onerror = (e) => {
                reject(e);
            }
            if(file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve("dist/img/boxed-bg.jpg");
            }
            
        });
    }

    /**
     * Get all values from form create users and return an object user
     * 
     * @param {*} formEl
     * @return {User} 
     */
    getValues(formEl){
        let user = {};
        let isValid = true;
        [...formEl.elements].forEach(function(field, index){
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false;
            }
            if(field.name == "gender"){
                if(field.checked){
                    user[field.name] = field.value;
                }
            } else if(field.name === "admin"){
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });        

        if(!isValid){
            return null;
        }

        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );
    }

    /**
     * get all users from the local storage and update de UI
     */
    selectAll(){
        let users = User.getUsersFromStorage();
        users.forEach(obj => {
            let user = new User();
            user.loadFromJSON(obj);
            this.addLine(user);
        })
    }
    
    /**
     * Add a new line to the table row
     * 
     * @param {User} dataUser 
     */
    addLine(dataUser){
        let tr = document.createElement("tr");
        this.updateTableRow(tr, dataUser);
        this.tableEl.appendChild(tr); 
        
        this.updateCount();
    }

    /**
     * Add events to buttons Edit and Delete of the table row.
     * 
     * @param {*} tr 
     */
    addEventsToTableRow(tr){
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if(confirm("Deseja realmente excluir?")) {
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();
                tr.remove();
                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {
            let json = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json){
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                if(field) {
                    switch (field.type){
                        case "file":
                            console.info("Not implement yet");
                            break;
                        case "radio":
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;
                        case "checkbox":
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();
        });
    }

    /**
     * Display the create user panel
     */
    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    /**
     * Display the upate user panel
     */
    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    /**
     * Update the counters (number of users and number of admins)
     */
    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr => {
            numberUsers++;
            let user = JSON.parse(tr.dataset.user);
            if(user._admin) numberAdmin++;
        });
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;       
    }
}