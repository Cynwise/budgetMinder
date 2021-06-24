let db;
let budgetVersion;
const request = indexedDb.open('budget', budgetVersion || 12);

request.onupgradeneeded = function(e) {
    console.log('Need to upgrade db');

    const {oldVersion} = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB upgraded to new version ${newVersion}`);
    db = e.target.result;

    if(db.objectStoreNames.length === 0){
        db.createObjectStore('BudgetStore', {autoIncrement: true});
    }
};

request.onerror = function (e) {
    console.log(`error ${e.target.errCode}`);
};

function checkDatabase() {
    console.log('checking db');
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        
        if(getAll.result.length > 0){
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((res) => {

                if(res.length !== 0){
                    transaction = db.transaction(['BudgetStore'], 'readwrite');
                    const currentStore = transaction.objectStore('BudgetStore');
                    currentStore.clear();
                    console.log('store wiped');
                }
            });
        }
    };
}

request.onsuccess = function (e) {

    console.log('success');
    db = e.target.result;

    if(navigator.onLine){
        checkDatabase();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');
    store.add(record);
};

window.addEventListener('online', checkDatabase);