// App config
const express = require('express');
const app = express();
// HTTP config
const cors = require('cors');
const helmet = require('helmet');
const compression = require("compression");
// File system
const fs = require('fs');
const path = require('path');
// Data
const Bank_NAMES = require('./data/BANK_NAMES.json');
const Bank_OBJ = require('./data/BANK_OBJ.json');

// set security HTTP headers - https://helmetjs.github.io/
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// redirects to routes => redirects to controller => gets data from DB & returns resolved / rejected promise
app.get('/', (req, res) => {
    res.status(200).json('Express server works!');
})

app.get('/banks', (req, res) => {
    res.status(200).json(Bank_NAMES.sort());
})

app.get('/bank/:bankValue', (req, res) => {

    const { bankValue } = req.params;
    // console.log('"Bank Name" => ', bankValue);

    try {
        // Generate bank states data
        generateBankStates(bankValue);
        // Read bank states data
        const data = getBankStates();
        // Sort names
        const sortedData = JSON.parse(data).sort();

        res.status(200).json(sortedData);

    } catch (error) {
        console.error(error);
    }
})

app.get('/bank/:bankValue/:stateValue', async (req, res) => {

    const { bankValue, stateValue } = req.params;
    // console.log(stateValue);

    try {
        // Generate districts data
        generateBankDistricts(bankValue, stateValue);
        // Read districts data
        const data = getBankDistricts();
        // Sort names
        const sortedData = JSON.parse(data).sort();

        res.status(200).json(sortedData);

    } catch (error) {
        console.error(error);
    }
})

app.get('/bank/:bankValue/:stateValue/:districtValue', async (req, res) => {

    const { bankValue, stateValue, districtValue } = req.params;
    // console.log(districtValue);

    try {
        // Generate branches data
        generateBankBranches(bankValue, districtValue);
        // Read branches data
        const data = getBankBranchs();
        // Sort names
        const sortedData = JSON.parse(data).sort();

        res.status(200).json(sortedData);

    } catch (error) {
        console.error(error);
    }

});

app.get('/details/:bankValue/:stateValue/:districtValue/:branchValue', (req, res) => {
    const { bankValue, stateValue, districtValue, branchValue } = req.params;

    // Generate & get bank details
    const bankDetails = generateBankDetails(bankValue, branchValue);

    res.status(200).json(bankDetails);
})


module.exports = app;


// Read & write operation functions

// => ./db contains 244 json files grouped by bank codes.
// => ./data contains generated files for retrieving bank related details during runtime. 

function generateBankNamesAndBankObjects() {
    fs.readdir(path.join(__dirname, 'db'), 'utf8', (error, fileNames) => {
        if (error) {
            console.error(error);
        }

        // let bankCodes = [];
        // let bankNames = [];
        let bankObj = [];
        let fileNamesLength = fileNames.length;

        fileNames.map(fileName => {
            fs.readFile(path.join(__dirname, 'db', fileName), 'utf-8', (error, data) => {
                if (error) {
                    console.error(error);
                }

                const parsedData = JSON.parse(data); // object
                const bankCode = Object.keys(parsedData)[0]; // string
                const bankName = parsedData[bankCode].BANK; //string

                // bankNames.push(bankName);

                bankObj.push({
                    BANK: bankName,
                    IFSC: bankCode
                });

                if (bankObj.length === fileNamesLength) {
                    // Write Bank Names
                    fs.writeFileSync(path.join(__dirname, 'data', 'BANK_OBJ.json'), JSON.stringify(bankObj));
                    console.log('Wrtie operation completed');
                }
            })
        });
    })
}

function generateBankStates(bankName) {

    const findBankCode = Bank_OBJ.find(obj => obj.BANK === bankName).IFSC;
    const getFileName = findBankCode.substring(0, 4);

    console.log(`${getFileName}.json`);

    const data = fs.readFileSync(`./db/${getFileName}.json`, 'utf-8');

    const bankObject = JSON.parse(data);
    const bankEntries = Object.entries(bankObject);

    const bankStatesRaw = bankEntries.map(value => {
        return value[1].STATE; // contains duplicates
    });

    const bankStates = bankStatesRaw.filter((item, index) => {
        return bankStatesRaw.indexOf(item) === index; // returns unique values
    })

    fs.writeFileSync(path.join(__dirname, 'data', `Bank_STATES.json`), JSON.stringify(bankStates));

    // console.log('Generated Bank State Names');
}

function getBankStates() {
    const data = fs.readFileSync('./data/BANK_STATES.json', 'utf-8');
    // console.log('Read Bank State Names');
    return data;
}

function generateBankDistricts(bankName, bankState) {

    const findBankCode = Bank_OBJ.find(obj => obj.BANK === bankName).IFSC;
    const getFileName = findBankCode.substring(0, 4);

    // console.log(`${getFileName}.json`);

    const data = fs.readFileSync(path.join(__dirname, 'db', `${getFileName}.json`), 'utf-8');

    const bankObject = JSON.parse(data);
    const bankEntries = Object.entries(bankObject);

    const bankDetailsRaw = bankEntries.map(value => {
        return {
            STATE: value[1].STATE,
            DISTRICT: value[1].DISTRICT
        }
    });
    const matchBankState = bankDetailsRaw.filter(object => object.STATE === bankState);

    const bankDistrictsRaw = matchBankState.map(object => object.DISTRICT); // contains duplicates

    const bankDistricts = bankDistrictsRaw.filter((item, index) => {
        return bankDistrictsRaw.indexOf(item) === index; // returns unique values
    })

    fs.writeFileSync(path.join(__dirname, 'data', `Bank_DISTRICTS.json`), JSON.stringify(bankDistricts));

    // console.log('Generated Bank Districts Names');
}

function getBankDistricts() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'Bank_DISTRICTS.json'), 'utf-8');
    // console.log('Read Bank Districts Names');
    return data;
}

function generateBankBranches(bankName, bankDistrict) {

    const findBankCode = Bank_OBJ.find(obj => obj.BANK === bankName).IFSC;
    const getFileName = findBankCode.substring(0, 4);

    // console.log(`${getFileName}.json`);

    const data = fs.readFileSync(path.join(__dirname, 'db', `${getFileName}.json`), 'utf-8');

    const bankObject = JSON.parse(data);
    const bankEntries = Object.entries(bankObject);

    const bankDetailsRaw = bankEntries.map(value => {
        return {
            DISTRICT: value[1].DISTRICT,
            BRANCH: value[1].BRANCH,
        }
    });
    const matchBankDistrict = bankDetailsRaw.filter(object => object.DISTRICT === bankDistrict);

    const bankBranchsRaw = matchBankDistrict.map(object => object.BRANCH); // contains duplicates

    // console.log(bankBranchsRaw);

    const bankBranches = bankBranchsRaw.filter((item, index) => {
        return bankBranchsRaw.indexOf(item) === index; // returns unique values
    });

    fs.writeFileSync(path.join(__dirname, 'data', `Bank_BRANCHES.json`), JSON.stringify(bankBranches));

    // console.log('Generated Bank Branches Names');
}

function getBankBranchs() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'Bank_BRANCHES.json'), 'utf-8');
    // console.log('Read Bank Branches Names');
    return data;
}

function generateBankDetails(bankName, bankBranch) {

    const findBankCode = Bank_OBJ.find(obj => obj.BANK === bankName).IFSC;
    const getFileName = findBankCode.substring(0, 4);

    // console.log(`${getFileName}.json`);

    const data = fs.readFileSync(path.join(__dirname, 'db', `${getFileName}.json`), 'utf-8');

    const bankObject = JSON.parse(data);
    const bankEntries = Object.entries(bankObject);

    const bankDetailsRaw = bankEntries.map(value => {
        return value[1]; // bank object
    });
    const matchBankBranch = bankDetailsRaw.filter(object => object.BRANCH === bankBranch)[0];
    // console.log('Branch Details => ', matchBankBranch);

    return matchBankBranch;
}