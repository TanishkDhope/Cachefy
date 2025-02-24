#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import { spawn } from "child_process";
import axios from "axios";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const program = new Command();

program
  .name("Caching Server")
  .description("CLI tool to run a caching proxy server")
  .version(packageJson.version)
  .option("--port <port>", "Port to run the server on")
  .option("--origin <origin>", "Origin server to proxy requests to");

program.action(() => {
  const { port, origin } = program.opts();

  if (!port || !origin) {
    console.error("Error: Port and Origin are required!");
    process.exit(1);
  }

  console.log(`Starting caching server on port ${port}, proxying to ${origin}...`);

  const child = spawn("node", ["server.js", port, origin], {detached: true, stdio: "ignore"});
  fs.writeFileSync("server.pid", child.pid.toString());

  child.unref();

});

program.command("clear")
.option("--port <port>", "Port of the caching server")
.action(async () => {
  const { port } = program.opts();
  try{
    console.log(program.opts());

    await axios.get(`http://localhost:${port}/clear`);
    console.log("Cache cleared successfully.");
  }
  catch(err){
    console.error("Error clearing cache:", err.message);
  }
});


program
.command("stop")
.action(() => {
  try {
    const pid = fs.readFileSync("server.pid", "utf8");
    process.kill(pid, "SIGTERM");
    console.log("Server stopped successfully.");
    fs.unlinkSync("server.pid");
  } catch (err) {
    console.error("Error stopping server:", err.message);
  }
  return;
});



program.parse(process.argv);
