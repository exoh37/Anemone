function addItem() {

  var userInput = document.getElementById('user').value.trim();

  if(userInput.endsWith('.xml')){

    var listItem = document.createElement('li');
    listItem.textContent = userInput;

    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() {
        listItem.remove();
    };

    listItem.appendChild(deleteButton);
    document.getElementById('list').appendChild(listItem);
    document.getElementById('user').value = '';
  }

  else{
    alert('Input must end with ".xml"');
    document.getElementById('user').value = '';
  }
  return false;
}


function readURL(input) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
          $('#blah')
              .attr('src', e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
  }
}