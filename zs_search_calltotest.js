#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const auth = process.env.AUTH;
const authToken = Buffer.from(auth).toString('base64');
const baseUrl = process.env.BASE_URL;
const search = `projectKey = "${process.env.PROJECT_KEY}"`;
const query = `query=${encodeURIComponent(search)}&fields=key,name,testScript&maxResults=5000`;

const options = {
  hostname: `${baseUrl}`,
  path: `/rest/atm/1.0/testcase/search?${query}`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${authToken}`
  }
};

const getTestCases = () => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        const testCases = JSON.parse(data);
        resolve(testCases);
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.end();
  });
};

const filterTestCases = (testCases) => {
    return testCases.filter((testCase) => {
      const testScript = testCase.testScript;
      if (!testScript || !Array.isArray(testScript.steps)) {
        return false;
      }
      for (let i = 0; i < testScript.steps.length; i++) {
        if (testScript.steps[i].hasOwnProperty("testCaseKey")) {
          return true;
        }
      }
      return false;
    });
  };
  
  
const writeTestCases = (testCases) => {
  const outputDir = './output';
  fs.writeFile(`${outputDir}/all_test_cases.json`, JSON.stringify(testCases, null, 2), err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Test cases saved to ${outputDir}/all_test_cases.json`);
  });
};



const buildCalledTestCasesList = (inputFilePath, outputFilePath) => {
  try {
    const input = fs.readFileSync(inputFilePath);
    const testCases = JSON.parse(input);

    const calledTestCases = testCases.map((testCase) => {
      const calledTests = [];
      const testScript = testCase.testScript;
      if (testScript && Array.isArray(testScript.steps)) {
        for (let i = 0; i < testScript.steps.length; i++) {
          const step = testScript.steps[i];
          console.log(step);
          if (step.hasOwnProperty("testCaseKey")) {
            calledTests.push({
              "testCaseKey": step.testCaseKey,
              "id": step.id,
              "index": step.index,
              "stepParameters": step.stepParameters
            });
          }
        }
      }
      return {
        "name": testCase.name,
        "key": testCase.key,
        "called_tests": calledTests
      };
    });

    fs.writeFileSync(outputFilePath, JSON.stringify(calledTestCases, null, 2));
    console.log(`Called test cases saved to ${outputFilePath}`);
  } catch (error) {
    console.error(error);
  }
};


const main = async () => {
  const testCases = await getTestCases();
  const filteredTestCases = filterTestCases(testCases);
  writeTestCases(filteredTestCases);
  
};

main().catch((error) => {
  console.error(error);
});

const inputFilePath= "./output/all_test_cases.json"
const outputFilePath= "./output/list_called_test_cases.json"

buildCalledTestCasesList(inputFilePath, outputFilePath);