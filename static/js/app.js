// Define the URL
let url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Define global variables to hold the data
let samplesData;
let metadata;

// Function to update the demographic info
function updateDemographicInfo(id) {
    // Get the metadata for the selected ID
    let selectedMetadata = metadata.filter(sample => sample.id == id)[0];

    // Select the demographic info panel
    let demoInfo = d3.select("#sample-metadata");

    // Clear any existing metadata
    demoInfo.html("");

    // Append each key-value pair to the panel
    Object.entries(selectedMetadata).forEach(([key, value]) => {
        demoInfo.append("h5").text(`${key}: ${value}`);
    });
}

// Function to update the bar chart
function updateBarChart(newID) {
    // Filter the data for the selected ID
    let selectedSample = samplesData.samples.filter(sample => sample.id == newID)[0];

    // Create an array of objects to keep the association between otu_ids, sample_values, and otu_labels
    let otuData = selectedSample.otu_ids.map((id, index) => {
        return {
            otu_id: id,
            sample_value: selectedSample.sample_values[index],
            otu_label: selectedSample.otu_labels[index]
        };
    });

    // Sort the array by sample_value in descending order
    otuData.sort((a, b) => b.sample_value - a.sample_value);

    // Select the top 10 OTUs and reverse the array for ascending order
    let topOTUs = otuData.slice(0, 10).reverse();

    // Get the data for the top 10 OTUs
    let values = topOTUs.map(d => d.sample_value);
    let labels = topOTUs.map(d => `OTU ${d.otu_id}`);
    let hovertext = topOTUs.map(d => d.otu_label);

    // Create the trace for the bar chart
    let trace = {
        x: values,
        y: labels,
        text: hovertext,
        type: 'bar',
        orientation: 'h'
    };

    // Create the data array for the plot
    let plotData = [trace];

    // Define the plot layout
    let layout = {
        title: "Top 10 OTUs",
        xaxis: { title: "Sample Values" },
        yaxis: { title: "OTU IDs" }
    };

    // Plot the bar chart to a div tag with id "bar"
    Plotly.newPlot('bar', plotData, layout);
}

// Function to update the bubble chart
function updateBubbleChart(newID) {
    // Filter the data for the selected ID
    let selectedSample = samplesData.samples.filter(sample => sample.id == newID)[0];

    // Get the data for the bubble chart
    let bubbleXValues = selectedSample.otu_ids;
    let bubbleYValues = selectedSample.sample_values;
    let bubbleMarkerSize = selectedSample.sample_values; // Scale the marker sizes
    let bubbleMarkerColors = selectedSample.otu_ids;
    let bubbleTextValues = selectedSample.otu_labels;

    // Create the trace for the bubble chart
    let bubbleTrace = {
        x: bubbleXValues,
        y: bubbleYValues,
        text: bubbleTextValues,
        mode: 'markers',
        marker: {
            size: bubbleMarkerSize,
            color: bubbleMarkerColors,
            colorscale: 'Earth' // Use the 'Earth' color scale
        }
    };

    // Create the data array for the bubble plot
    let bubbleData = [bubbleTrace];

    // Define the plot layout for the bubble chart
    let bubbleLayout = {
        title: 'Bubble Chart for Each Sample',
        showlegend: false,
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Sample Values" },
        height: 600,
        width: 1200
    };

    // Plot the bubble chart to a div tag with id "bubble"
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
}

// Function to handle change on dropdown menu
function optionChanged(newID) {
    // Update the demographic info
    updateDemographicInfo(newID);

    // Update the bar chart
    updateBarChart(newID);

    // Update the bubble chart
    updateBubbleChart(newID);
}

// Use D3 to fetch the JSON data
d3.json(url).then(function(data) {
    // Assign the data to the global variables
    samplesData = data;
    metadata = data.metadata;

    // Select the dropdown menu
    let dropdownMenu = d3.select("#selDataset");

    // Append each ID to the dropdown menu
    metadata.forEach(sample => {
        dropdownMenu.append("option").text(sample.id).property("value", sample.id);
    });

    // Add event listener for change on dropdown menu
    dropdownMenu.on("change", function() {
        // Get the new ID
        let newID = dropdownMenu.property("value");

        // Update the demographic info, the bar chart, and the bubble chart
        optionChanged(newID);
    });

    // Initialize the demographic info, the bar chart, and the bubble chart with the first ID
    updateDemographicInfo(metadata[0].id);
    updateBarChart(metadata[0].id);
    updateBubbleChart(metadata[0].id);
}).catch(function(error) {
    console.log("Error:", error);
});
