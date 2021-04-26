import "phaser";
import "regenerator-runtime/runtime";

import IPFS from "ipfs-core";
import uint8ArrayConcat from "uint8arrays/concat";

import { initContract, login, logout } from "./js/utils";

import getConfig from "./config";
const { networkId } = getConfig(process.env.NODE_ENV || "development");

import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";
import FileChooserPlugin from "phaser3-rex-plugins/plugins/filechooser-plugin.js";

import MainMenuScene from "./js/MainMenuScene";
import GameplayScene from "./js/GameplayScene";
import LevelEditorScene from "./js/LevelEditorScene";
import BrowseLevelsScene from "./js/BrowseLevelsScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    plugins: {
        global: [
            {
                key: "rexInputTextPlugin",
                plugin: InputTextPlugin,
                start: true
            },
            {
                key: "rexFileChooser",
                plugin: FileChooserPlugin,
                start: true
            },
        ],
        scene: [
            {
                key: "rexUI",
                plugin: UIPlugin,
                mapping: "rexUI"
            },
        ]
    }
};

class Game extends Phaser.Game {
    constructor() {
        super(config);
        this.scene.add("MainMenu", MainMenuScene);
        this.scene.add("Gameplay", GameplayScene);
        this.scene.add("LevelEditor", LevelEditorScene);
        this.scene.add("BrowseLevelsMenu", BrowseLevelsScene);
        this.scene.start("MainMenu");
    }
}

window.onload = async function () {
    const game = new Game();

    window.ipfsNode = await IPFS.create();
    //const stats = await ipfsNode.files.stat("/");
    //console.log(stats);
};

function signedOutFlow() {
    console.log("Not signed in");
}

function signedInFlow() {
    console.log("Signed in as:", window.accountId);
    console.log("Contract link:", window.contract.contractId);
}

window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error);