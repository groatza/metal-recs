const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.metal-archives.com/bands/Electric_Wizard') 
	.then(({ data }) => {
        const $ = cheerio.load(data);

        const bandLink = $(".band_name a").attr('href');
        const bandID = bandLink.split("/").pop();
        
        return axios.get(`https://www.metal-archives.com/band/ajax-recommendations/id/${bandID}`);
  })
  .then(({ data }) => {
    const $ = cheerio.load(data);

    const bandEntries = [];
    $("tbody tr").each((_, row) => {
      const $row = $(row);
      const rowData = {};

      rowData.bandName = $row.find('td:nth-child(1) a').text();
      rowData.bandLink = $row.find('td:nth-child(1) a').attr('href');
      rowData.country = $row.find('td:nth-child(2)').text();
      rowData.genre = $row.find('td:nth-child(3)').text();
      rowData.score = $row.find('td:nth-child(4) span').text();

      bandEntries.push(rowData);
    });

    bandEntries.pop(); //remove "see more" etc

    const promises = bandEntries.map(entry => {
        const bandLink = entry.bandLink;
        return axios.get(bandLink)
          .then(({ data }) => {
            const $ = cheerio.load(data);
            const highestRatedAlbum = {
                name : "",
                year : 0,
                numRatings : 0,
                score : 0,
            };

            $('.discog tr').each((_, row) => { //each album
                const $row = $(row);
                let rating = $row.find('td:nth-child(4) a').text();
                const [numRatings, score] = rating.split(" ").map(value => parseInt(value));

                if ( numRatings > highestRatedAlbum.numRatings || (numRatings == highestRatedAlbum.numRatings && score > highestRatedAlbum.score) ) { //fix for %
                    highestRatedAlbum.name = $row.find('td:nth-child(1) a').text();
                    highestRatedAlbum.year = $row.find('td:nth-child(3)').text();
                    highestRatedAlbum.numRatings = numRatings;
                    highestRatedAlbum.score = score;
                }
                highestRatedAlbum.name = "cum";
            });
            entry.highestRatedAlbum = highestRatedAlbum;
            return entry;
          })
          .catch(error => {
            console.error(`Error fetching data for band: ${entry.bandName}`);
            console.error(error);
            return entry;
          });
      });

      Promise.all(promises)
      .then(results => {
        console.log('Band entries with bleck data:');
        console.log(results);
      })
      .catch(error => {
        console.error('Error occurred while fetching bleck data for bands:');
        console.error(error);
      });
  })
  .catch(error => {
    console.error(error);
  });