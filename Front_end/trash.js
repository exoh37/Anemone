
window.onload = function(){
    var listItem = document.createElement('li');
    listItem.setAttribute("id", "listItem")
    var storageItem = localStorage.getItem("trash");
    listItem.textContent = storageItem;
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Restore';
    deleteButton.onclick = function() {
        listItem.remove();
    };

    listItem.appendChild(deleteButton);
    document.getElementById('list').appendChild(listItem);

};