function addItem() {
  var input = document.getElementById('fileInput');
  var userInput = input.files[0].name;



  var progressBar = document.querySelectorAll(".progress-bar");
  var progressBarStyle = document.getElementById("pass-bar");
  var displaySetting =  progressBarStyle.style.display;

  progressBarStyle.style.display = 'flex';

  var time = 2000;
  

  progressBar.forEach(function(i) {
    let label = i.children[0];
    let line = i.children[1];
    let count = 0;
    let dataCount = label.getAttribute("data-count");
    let lineCount = line.children[0];
 
    let runTime = time/dataCount;
    
    let animationLineCount = setInterval(function(){
      if(count < dataCount){
        count++;
        label.innerHTML = count + '%';
        lineCount.style.width = count + '%';
      }
    },runTime);
  });



  setTimeout(function() {
    var listItem = document.createElement('li');
    listItem.setAttribute("id", "listItem")
    listItem.textContent = userInput;
    input.value = '';
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'Delete';
    deleteButton.onclick = function() {
      let trashInfo = document.getElementById('listItem').firstChild.nodeValue.trim();
      localStorage.setItem("trash", trashInfo);
      listItem.remove();
    };

    listItem.appendChild(deleteButton);
    document.getElementById('list').appendChild(listItem);
    // Clear the file input
    input.value = '';
    
    progressBarStyle.style.display = 'none';
    
  }, 2000);


  return false;
}

function readURL(input, callback) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var userInput = e.target.result;
      callback(userInput);
    };

    reader.readAsText(input.files[0]);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function searchItem() {
  var searchTerm = document.getElementById('search').value.trim().toLowerCase();
  var listItems = document.getElementById('list').getElementsByTagName('li');
  console.log(listItems);
  var found = false;

  for (var i = 0; i < listItems.length; i++) {
    var listItemText = listItems[i].textContent.toLowerCase();
    if (listItemText.includes(searchTerm)) {
      found = true;
      break;
    }
  }

  if (found) {
    sleep(1000);
    window.location.href = "Invoice.html";

  } else {
    alert("Search term not found!");
  }
};




function previewFile() {
  return new Promise((resolve, reject) => {
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        resolve(reader.result);
      },
      false
    );

    reader.addEventListener(
      "error",
      () => {
        reject(reader.error);
      },
      false
    );

    if (file) {
      reader.readAsText(file);
    } else {
      reject(new Error("No file selected"));
    }
  });
}