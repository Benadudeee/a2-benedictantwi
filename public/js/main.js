// FRONT-END (CLIENT) JAVASCRIPT HERE
const loadData = async function ( ){
    const response = await fetch("/get_list", {
      method: "GET"
    })

    if(!response.ok){
      throw new Error(`Response status: ${response.status}`);
    }

    const taskItems = await response.text();
    const taskItemsData = JSON.parse(taskItems);

    // Load Cards
    const cardContainer = document.querySelector(".cardlist");
    cardContainer.innerHTML = null;

    taskItemsData.forEach( (item, i) => {
        const cardItem = document.createElement('div');
        cardItem.className = `card--item ${ (!item.is_finished)? 'incomplete' : 'complete' }`;

        // Make Due / Created a date object as date objects in mode server are strings.
        const created_at = new Date(item.created_at);
        const due_at_date = new Date(item.due_at);

        // Html for cards, will code the buttons outside the function after it loads
        cardItem.innerHTML =   ` 
            
              <h3> ${item.name} </h3>
              <p> ${item.description} </p>

              <p>${(!item.is_finished)? 'incomplete' : 'complete'} </p>

              <p> Due in: ${item.time_till_finished} days</p>
              <p> Due at: ${due_at_date.toDateString()} </p>
              <p> Created at: ${created_at.toDateString()} </p>

              <div class="card--item--actions ${i}"> 
                <button data-id="${item.id}" class="button delete"> Delete Task </button>
                <button data-id="${item.id}" class="button finish"> ${ (!item.is_finished)? 'Finish Task' : 'Set Incomplete' } </button>
              </div>
           
      `;
      cardContainer.appendChild(cardItem);
    }
  );


  hydrateCardBtns();
}

const hydrateCardBtns = function () {
  const deleteBtns = document.querySelectorAll(".button.delete");
  const finishBtns = document.querySelectorAll(".button.finish");

  console.log(deleteBtns, finishBtns);

  deleteBtns.forEach((btn) => btn.addEventListener("click" , () => removeTask(btn.dataset.id)));
  finishBtns.forEach((btn) => btn.addEventListener("click", () => toggleFinished(btn.dataset.id)));
}

const removeTask = async function ( id ) {
  const url = `/delete_task/${id}`;

  console.log(url);
  const response = await fetch(url, {
    method: 'DELETE'
  });

  const status = await response.text();
  if(status === 'success'){
    loadData();
  }
}

const toggleFinished = async function ( id ) {
  const url = `/toggle_finished/${id}`;
  const response = await fetch(url, {
    method: 'PUT'
  });

  const status = await response.text();
  if(status === 'success'){
    console.log("success")
    loadData();
  }
}


const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const name = document.querySelector(".name");
  const description = document.querySelector(".description");
  const due_at = document.querySelector(".date");
  const status = document.querySelector(".status");

  console.log(due_at.value);
  
  const json = { 
    id: null,
    name: name.value ,
    description: description.value,
    due_at: new Date(due_at.value),
    status: status.value,

    is_finished: false,
    created_at: new Date(),
    time_till_finished: null,
  };

  const body = JSON.stringify( json );
  
  const response = await fetch( "/submit", {
    method:"POST",
    body 
  })

  if(response.ok){
    const data = await response.text();
    // console.log(response);
    // console.log( "text:", data )

    loadData();
  }
}

window.onload = function() {
  const button = document.querySelector(".form-add-btn");
  button.onclick = submit;

  loadData();
}
