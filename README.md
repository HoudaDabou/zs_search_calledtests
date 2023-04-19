# zs_search_calledtests
This script is based on Zephyr Scale Server REST API:
It search for all test cases in a given project via ```GET /testcase/search``` and returns test cases that call other tests.


## Requirements
NodeJs 14.x

## How to use

### Install node dependencies with:

```
npm install
```

### Run the script
This command generates ```./output/list_called_test_cases.json``` output including all test cases that call others:

```
AUTH=username:password BASE_URL=<your_jira_url> PROJECT_KEY=<your_project_key> node zs_search_calltotest.js
```
The ```BASE_URL``` value should not include ```http``` or ```https```.
