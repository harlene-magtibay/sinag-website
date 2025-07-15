import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const API_URL = "https://api.sunrise-sunset.org/";

app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.post("/", async (req, res) => {
    console.log(req.body);
    const [latitude, longitude] = req.body.location.split(",");
    console.log("Longitude:", longitude, "Latitude:", latitude);
    if (!latitude || !longitude) {
      return res.render("index.ejs", { error: "Invalid Coordinates" });
    }

    const lat = parseFloat(latitude.trim());
    const lng = parseFloat(longitude.trim());

    const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90;
    const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180;

    if (!isValidLat || !isValidLng) {
        return res.render("index.ejs", { error: "Invalid coordinates" });
    }
    
    try {
        const currentDay = new Date();
        const week1 = new Date(currentDay);
        const week2 = new Date(currentDay);
        week1.setDate(currentDay.getDate() + 7);
        week2.setDate(currentDay.getDate() + 14);

        console.log("Today is:", currentDay.toDateString());
        console.log("Next Week is:", week1.toDateString());
        console.log("Next next week is:", week2.toDateString());
        
        const response = await axios.get(
            API_URL + `json?lat=${latitude}&lng=${longitude}&date=${currentDay.toDateString()}&tzid=Asia/Manila`
        );
        const response1 = await axios.get(
          API_URL +
            `json?lat=${latitude}&lng=${longitude}&date=${week1.toDateString()}&tzid=Asia/Manila`
        );
        const response2 = await axios.get(
          API_URL +
            `json?lat=${latitude}&lng=${longitude}&date=${week2.toDateString()}&tzid=Asia/Manila`
        );
        console.log("Sunrise and Sunset data for today:", response.data);
        console.log("Sunrise and Sunset data for next week:", response1.data);
        console.log("Sunrise and Sunset data for next next week:", response2.data);
        res.render("index.ejs", { dataToday: response.data, dateToday: currentDay.toDateString(), dataWeek1: response1.data, dateWeek1: week1.toDateString(), dataWeek2: response2.data, dateWeek2: week2.toDateString() });
    } catch (error) {
      console.log("Failed to make request: ", error.message);
      res.render("index.ejs", {
        content: JSON.stringify(error.response.data),
      });
    }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
