require("dotenv").config();

const app = require("./src/app");
const ConnectToDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await ConnectToDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
