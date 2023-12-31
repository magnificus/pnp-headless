import puppeteer, { Browser, Page } from 'puppeteer';
import express from 'express';
import * as path from 'path';
var cors = require('cors');


const fs = require("fs");
const PORT = 16301;

class LoadedGraph{
    constructor(name : string,graph : any){
        this.name = name;
        this.graph = graph;
    }
    name:string;
    graph:any;
}

let loadedGraphs : LoadedGraph[] = []; // graph to serve to PNP page

function setupExpress(){
    const app = express();
    app.use(cors());
    app.get('/graphs', (req,res) => {
        res.send(loadedGraphs.map(graph => graph.name));
    })
    loadedGraphs.forEach(graph => {
        app.get('/graphs/' + graph.name, (req, res) => {
            res.send(graph.graph);
        });
    })
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

function readLocalGraphs() {
    const dir = "graphs";
    if (!fs.existsSync(dir)){
        throw "Found no graphs folder, exiting";
    }
    const fileNames = fs.readdirSync(dir);

    for (const name of fileNames) {
        const filePath = path.join(dir, name);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            const graph = JSON.parse(fileContent);
            loadedGraphs.push({name: name.replaceAll(".ppgraph", ""), graph});
        } catch (error) {
            console.error(`Failed to parse file ${name} as JSON.`, error);
        }
    }
}



async function launchPNP(pnpFolder: string): Promise<void> {
    // Launch a new browser instance
    const browser: Browser = await puppeteer.launch({dumpio: true,
        args: ['--disable-web-security'],
        headless:"new"
    });

    // Open a new page for every graph

    loadedGraphs.forEach(async graph => {
        const page: Page = await browser.newPage();
        // Construct the file URL
        const fileURL = `file://${pnpFolder}?fetchLocalGraph=${graph.name}`;
        //await page.goto(`file:///${__dirname.replace()}/pnp/index.html?fetchLocalGraph=${graph.name}`);
        await page.goto(fileURL);
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Take a screenshot
        await page.screenshot({ path: 'screenshot.png' });
        console.log("screenshot taken");
    });
	
    // Close the browser
    //await browser.close();
};

const pnpFolder = path.join(__dirname, 'pnp', 'index.html');
if (!fs.existsSync(pnpFolder)){
      throw "Found no pnp folder, exiting";
}

readLocalGraphs();
setupExpress(); 
launchPNP(pnpFolder);



