import { connect, Contract, keyStores, WalletConnection } from "near-api-js"
import getConfig from "../config"

//const nearConfig = getConfig(process.env.NODE_ENV || "development")
const nearConfig = getConfig("development")

// Initialize contract & set global variables
export async function initContract(){
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ["getLevels"],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ["addLevel"],
  })
}

export function logout(){
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login(){
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName, "Gamedev.js Game")
}

export function createButton(scene, text, props){
    let buttonWidth = 40;
    let buttonHeight = 40;
    let buttonFontSize = "32px";
    let buttonColor = 0x3d619b;
    if(props){
        buttonWidth = props.width || buttonWidth;
        buttonHeight = props.height || buttonHeight;
        buttonFontSize = props.fontSize || buttonFontSize;
        buttonColor = props.buttonColor || buttonColor;
    }
    return scene.rexUI.add.label({
        width: buttonWidth,
        height: buttonHeight,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 2, buttonColor),
        text: scene.add.text(0, 0, text, {
            fontSize: buttonFontSize
        }),
        space: {
            left: 12,
            right: 12,
        },
        align: "center"
    });
}