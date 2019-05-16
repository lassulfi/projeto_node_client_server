class User {
    
    constructor(name, gender, birth, country, email, password, photo, admin){
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    set photo(value) {
        this._photo = value;
    }

    get admin() {
        return this._admin;
    }

    get register() {
        return this._register;
    }

    /**
     * Load a user from a JSON object
     * @param json
     */
    loadFromJSON(json) {
        for(let name in json){
            switch(name){
                case "_register":
                    this[name] = new Date(json[name]);
                    break;
                default:
                if(name.substring(0, 1) === "_") this[name] = json[name];
            }            
        }
    }

    /**
     * get all users form the the local storage
     * 
     * @return {User[]} users
     */
    static getUsersFromStorage() {
        return Fetch.get("/users");
    }

    /**
     * Saves an instance of the user in the database
     */
    save() {
        return new Promise((resolve, reject)=>{
            let promise;
            if(this.id){
                //update
                promise = Fetch.put(`/users/${this.id}`, this.toJson());
            } else {
                //create
                promise = Fetch.post("/users", this.toJson());
            }
            promise.then(data=>{
                this.loadFromJSON(data);
                resolve(this);
            }).catch(e=>{
                reject(e);
            });
        });
    }

    toJson(){
        let json = {};
        Object.keys(this).forEach(key => {
            if(this[key] !== undefined) json[key] = this[key];
        });
        return json;
    }

    remove() {
        return Fetch.delete(`/users/${this.id}`);
    }
}