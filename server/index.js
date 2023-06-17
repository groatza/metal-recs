const express = require('express');
const app = express();
const PORT = 8080;
const axios = require('axios');
const cheerio = require('cheerio');

app.listen(
  PORT,
  () => console.log("we runnin'")
);

app.post('/:bandName', async (req, res) => {
  const { bandName } = req.params;
  const bands = await getRecommendations(bandName);
  console.log(bands);
  res.status(200).send(bands);
});

const getRecommendations = (bandName) => {
    return axios.get(`https://www.metal-archives.com/bands/${bandName}`) //initial bands
      .then(({ data }) => getBandInfo(data))
      .then(({ data }) => getSimilarBands(data))
      .then(results => {
        //console.log(results);
        return results;
      })
      .catch(error => {
        console.error('Error occurred while fetching bleck data for bands:');
        console.error(error);
      });
  };
  
  const getBandInfo = (data) => {
    const $ = cheerio.load(data);
  
    const bandLink = $(".band_name a").attr('href');
    const bandID = bandLink.split("/").pop();
  
    return axios.get(`https://www.metal-archives.com/band/ajax-recommendations/id/${bandID}`);
  };
  
  const getSimilarBands = async (data) => {
    const $ = cheerio.load(data);
  
    const bandEntries = [];
    $("tbody tr").each((_, row) => {
      const $row = $(row);
      const rowData = {};
  
      rowData.bandName = $row.find('td:nth-child(1) a').text();
      rowData.bandLink = $row.find('td:nth-child(1) a').attr('href');
      rowData.bandID = rowData.bandLink.split("/").pop();
      rowData.country = $row.find('td:nth-child(2)').text();
      rowData.genre = $row.find('td:nth-child(3)').text();
      rowData.score = $row.find('td:nth-child(4) span').text();
  
      bandEntries.push(rowData);
    });
  
    bandEntries.pop(); //remove "see more" etc
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    bandEntries.pop();
    /*
    const promises = bandEntries.map(entry => getHighestRatedAlbum(entry));
    console.log("promises in getSimilarBands():", promises);
    return Promise.all(promises); //this the issue?
    */
    //add `async` to getSimilarBands()
    const promises = bandEntries.map(entry => getHighestRatedAlbum(entry));
    const resolvedPromises = await Promise.all(promises);
    console.log("promises in getSimilarBands():", resolvedPromises);
    return resolvedPromises; //this the issue?
    
  };
  
  const getHighestRatedAlbum = (entry) => {
    const bandLink = entry.bandLink;
    const bandID = entry.bandID;
    return axios.get(`https://www.metal-archives.com/band/discography/id/${bandID}/tab/all`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const highestRatedAlbum = {
          name: "",
          year: 0,
          numRatings: 0,
          score: 0,
        };
  
        $('tbody tr').each((_, row) => { //each album
          const $row = $(row);
          let rating = $row.find('td:nth-child(4) a').text();
          if (rating) {
            var [numRatings, score] = rating.split(" ");
            score = score.slice(1, -2);
          } else {
            var numRatings = 0;
            var score = 0;
          }
  
          if (numRatings > highestRatedAlbum.numRatings || (numRatings == highestRatedAlbum.numRatings && score > highestRatedAlbum.score)) {
            highestRatedAlbum.name = $row.find('td:nth-child(1) a').text();
            highestRatedAlbum.year = $row.find('td:nth-child(3)').text();
            highestRatedAlbum.numRatings = numRatings;
            highestRatedAlbum.score = score;
          }
        });
        entry.highestRatedAlbum = highestRatedAlbum;
        return entry;
      })
      .catch(error => {
        console.error(`Error fetching data for band: ${entry.bandName}`);
        console.error(error);
        return entry;
      });
  };
  