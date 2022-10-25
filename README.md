# Draculand

Draculand is a web app I built to control the Phillips Hue lights at my gaming table for a game of [Monster of the Week](https://evilhat.com/product/monster-of-the-week/) with [The Meddling Kids In: Too Many Draculas!](https://www.drivethrurpg.com/product/141243/The-Meddling-Kids-In-Too-Many-Draculas) mystery.

## Setup

The current state data stored in `api/states` is based on my current 4-light setup. The IDs used for each light are unique to my setup and will not work outside of it. If you want to use this for your home, you will first want to replace each state with your own setup by using the `api/record-setup.js` script. You will need to have a matching identifier for each light you want to use; I check against the string `Loft` in any light name for example.

Once you know how to record the lights you want to use and the lights are set to the state you want to save, run the following command to capture that data:

```bash
# replace state-name with the name of the state you are wanting to record: day, nightfall, etc..
node ./api/record-state state-name
```

Do this for each state and the `api` data will be mapped to your setup!

## Running the App

The easiest way to get up and running is to just run the app locally on your local network. First make sure the machine you are hosting the app on is accessible to other devices on the wifi, specifically ports `3000` (for the API) and `4173` (for the client.)

Once you have done that, open a new terminal/shell tab and navigate to the `api/` directory. There, run `npm start` and the API will discover and store the necessary info to communicate with your Hue Bridge and set up the API endpoints.

In another tab, navigate to the `client` directory. Before starting the app, open `package.json` and update the `build` script's `VITE_API_HOST` value to match the hosting machine's internal network IP address. This will make sure the client can communicate with the API.

After that, run `npm run build; npm run preview -- --host` to build the client and start a webserver that should be accessible at the hosting machine's internal network IP address on port `4173`. You should be able the client on a browser on any other device connected to the local wifi to control the app.
