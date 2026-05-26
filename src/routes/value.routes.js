const express = require("express");

const router = express.Router();

const upload = require("../middlewares/uploadFile.middleware");

const {
    verifyToken
} = require("../middlewares/auth.middleware");



const {
    createVault,
    getMyVaults,
    getSingleVault,
    updateVault,
    deleteVault,
    unlockVault,
} = require("../controllers/valut.controller");

// CREATE VAULT
router.post(
    "/create",
    verifyToken,
    upload.array("files", 5),
    createVault
);

// GET ALL VAULTS
router.get(
    "/my-vaults",
    verifyToken,
    getMyVaults
);

// GET SINGLE VAULT
router.get(
    "/:id",
    verifyToken,
    getSingleVault
);

// UPDATE VAULT
router.put(
    "/update/:id",
    verifyToken,
    updateVault
);

// DELETE VAULT
router.delete(
    "/delete/:id",
    verifyToken,
    deleteVault
);

// UNLOCK VAULT
router.post(
    "/unlock",
    verifyToken,
    unlockVault
);

module.exports = router;