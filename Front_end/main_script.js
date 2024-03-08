function othername() {
    var input = document.getElementById("user").value;  
    var jah = document.createElement("LI");
    var newButton = document.createElement("button");
    var create = document.createTextNode(input);
    //jah.addEventListener('onclick', boo());
    jah.onclick =  boo;
    newButton.onclick = boo;
    jah.appendChild(create);
    document.getElementById("list").appendChild(jah);
    document.getElementById("list").appendChild(newButton);
  }
  
  function boo(event)
  {
    //alert(event.target);
    event.target.parentNode.removeChild(event.target);
    
  }
  
  