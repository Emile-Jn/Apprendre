const XLSX = require('xlsx');
const fs = require('fs');

// Read the .xlsx file
const workbook = XLSX.readFile('/Users/emilejohnston/Documents/Language/Apprendre le français.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert the sheet to JSON, but keep it in an array of arrays format
const data = XLSX.utils.sheet_to_json(sheet, {header:1});
data.shift(); // Remove the first row because it's just headers

// Function to process the data
function processColumns(data) {
    const processedData = [];

    for (let col = 0; col < data[0].length; col += 3) { // Skip by 3 columns each time
        let columnPair = [];
        for (let row = 0; row < data.length; row++) {
            // Check if both cells in the pair have data
            if (data[row][col] != null && data[row][col + 1] != null) {
                columnPair.push([data[row][col], data[row][col + 1]]);
            }
        }
        processedData.push(columnPair);
    }

    return processedData;
}

const processedData = processColumns(data);

const jsonString = JSON.stringify(processedData, null, 2);

// console.log(jsonString); // print the resulting lists to the console

// Write the JSON string to a file
fs.writeFile('/Users/emilejohnston/IdeaProjects/Apprendre/vortoj.json', jsonString, 'utf8', err => {
    if (err) {
        console.error(err);
    } else {
        console.log('File successfully written');
    }
});