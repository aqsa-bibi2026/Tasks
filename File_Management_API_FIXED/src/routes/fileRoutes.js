const router = require("express").Router();

const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/fileController");

router.post("/upload", upload.single("file"), controller.uploadFile);

router.get("/", controller.getFiles);

router.get("/:filename", controller.getFile);

router.delete("/:filename", controller.deleteFile);

module.exports = router;
