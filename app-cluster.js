//this will run a single instance of node on each core
let os = require("os")
let cluster = require("cluster")

//start worker on each cpu core
function startWorker() {
  let worker = cluster.fork()
  console.log("start a new worker with id ", worker.id )

}

//are we on the main process
if (cluster.isMaster) {
  os.cpus().forEach(startWorker)
  
  cluster.on("disconnect", (worker) => {
  	console.log("worker  disconnected  id",worker.id)
  })

  cluster.on("exit", (worker) => {
  	console.log("worker exit id ",worker.id)
  	startWorker()
  })
}

else {
	require("./app")()
}