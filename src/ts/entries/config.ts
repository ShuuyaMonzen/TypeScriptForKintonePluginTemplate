/// <reference path="../../../node_modules/kypes/namespaces/index.ts" />

(() =>{
    class appConfig {
        public name: string;
        constructor(name: string) {
            this.name = name;
            console.log(moment().toDate() + " " + this.name);
            console.log($("body"));
        }
    }

    const appConfigValue = new appConfig('アプリ1');

    kintone.events.on("app.record.create.submit", (event)=>{
        if(event.record["a"]){
            event.record["a"].value = "125";
        }
    });
})();

