const http = require( "http" ),
      fs   = require( "fs" ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you"re testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require( "mime" ),
      dir  = "public/",
      port = 8000

/**
 * Planner
 * 
 * name: name of task
 * description: description of task
 * 
 * created_at: current date it was made
 * due_at: date where it's due
 * 
 * time_till_done: (created_at - due_at)
 * is_finished: boolean when the task is due
 * status: anything you want "finished" if (is_finished) is true
 */
const appdata = [
  // Dummy  task
  {
    id: "id1203020",
    name: "Get started on this app",
    description: "Try to make a single task by clicking create task",
    due_at: new Date('2099-08-24'),
    status: "working",

    is_finished: false,
    created_at: new Date(),

    time_till_finished: 27011,
  }
]

const generateAppdataId = function ( ) {
    return `id${Math.random().toString(16).slice(2)}`
}

const lookupAppdataId = function( id ){
  let ind = -1;

  for(let i = 0; i < appdata.length; i++){
    ind = i;

    if(id === appdata[i].id){
      return ind;
    }
  }

  return ind;
}

const server = http.createServer( function( request,response ) {
  if( request.method === "GET" ) {
    handleGet( request, response )    
  }else if( request.method === "POST" ){
    handlePost( request, response ) 
  }else if( request.method === "DELETE"){
    handleDelete( request, response )
  } else if(request.method === "PUT"){
    handlePut( request, response )
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === "/" ) {
    sendFile( response, "public/index.html" );

  }else if(request.url === "/get_list"){
    const data = appdata;

    request.on("data", function() {

    })
    request.on("end", function() {
      response.writeHead( 200, "OK", {"Content-Type" : "text/plain"} );
      response.end(JSON.stringify(appdata));
    })

  }else{
    sendFile( response, filename )
  }
}

const handlePut = function (request, response) {
  const urlParams = request.url.split("/").slice(1);
  // console.log(urlParams)
  if(urlParams[0] === 'toggle_finished'){
    request.on("data", function(){
    });
  
    request.on("end", function(){
      //Parse out i data
      const index = lookupAppdataId(urlParams[1]); // convert param into string to properly splice
      
      if(index == -1){
        response.writeHead( 404, "NOTFOUND", {"Content-Type": "text/plain" } );
        response.end("id can't be found")
      }

      appdata[index].is_finished = !(appdata[index].is_finished);

      // console.log(appdata[index].is_finished);

      response.writeHead( 200, "OK", {"Content-Type": "text/plain" } );
      response.end("success")
    });
  }
}

const handleDelete = function ( request, response ) {

  // Gets the main url with the paramters main/${id} this
  // is also used in the update function to update if the
  // task is finished of not. The main url is index [0]
  const urlParams = request.url.split("/").slice(1);
  // console.log(urlParams);

  if(urlParams[0] === 'delete_task'){
    request.on("data", function(){
    });
  
    request.on("end", function(){
      //Parse out i data
      const index = lookupAppdataId(urlParams[1]); // convert param into string to properly splice

      appdata.splice(index, 1);

      response.writeHead( 200, "OK", {"Content-Type": "text/plain" } );
      response.end("success")
    });
  }
}

const handlePost = function( request, response ) {
  let dataString = ""

  request.on( "data", function( data ) {
      dataString += data 
  })

  request.on( "end", function() {
    const postData = JSON.parse(dataString);
    // ... do something with the data here!!

    postData.id = generateAppdataId();

    const time_till_finished = new Date(postData.due_at) - new Date(postData.created_at);
    postData.time_till_finished = Math.round(time_till_finished / (1000 * 60 * 60 * 24)); // Daytime conversion

    // Convert time_till_finished in days

    appdata.push(postData);

    response.writeHead( 200, "OK", {"Content-Type": "text/plain" })
    response.end( "JSON.parse(dataString)" );
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we"ve loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { "Content-Type": type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( "404 Error: File Not Found" )

     }
   })
}

server.listen( process.env.PORT || port )
