import { Server } from "./server";
const server: any = require("http").Server(new Server().app);
let port = process.env.PORT || 7900;
import crons from "./services/CronJob";
const cron = require("node-cron");

server.listen(port, () => {
  console.log(`server is listening at port ${port}`);

  // cron.schedule('* * * * *', () => {
  //   console.log('Running a expire Banner cron');
  //   crons.expireBanner()
  // });
});
