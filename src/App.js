import "./App.css";
import {
  MenuItem,
  FormControl,
  Card,
  CardContent,
  Select,
} from "@material-ui/core";
import Map from "./Map";
import React from "react";
import reactDom from "react-dom";
import InfoBox from "./InfoBox";
import Table from "./Table"
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

// API:-https://disease.sh/v3/covid-19/countries

function App() {
  const [countries, setCountries] = React.useState([]);
  const [country, setCountry] = React.useState("worldwide");
  const [countryInfo, setCountryInfo] = React.useState({});
  const[tableData, setTableData] = React.useState([]);
  const [mapCenter, setMapCenter] = React.useState({ lat: 20.5937, lng: 78.9629 });
  const[mapZoom, setMapZoom]=React.useState(5);
  const[mapCountries, setMapCountries]=React.useState([]);
  const[casesType, setCases]=React.useState("cases");
  React.useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
  React.useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countrie = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countrie);
        });
    };
    getCountriesData();
  }, []);
  const onCountryChange = async (event) => {
    const con = event.target.value;

    const url =
      con === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${con}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(con);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => {
                const { name, value } = country;
                return <MenuItem value={value}>{name}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCases("cases")}
            title="CoronaVirus Cases"
            total={prettyPrintStat(countryInfo.cases)}
            cases={prettyPrintStat(countryInfo.todayCases)}
          ></InfoBox>
          <InfoBox
            title="Recovered"
            active={casesType === "recovered"}
            onClick={(e) => setCases("recovered")}
            total={prettyPrintStat(countryInfo.recovered)}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
          ></InfoBox>
          <InfoBox
            isRed
            active={casesType === "deaths"}
            title="Deaths"
            onClick={(e) => setCases("deaths")}
            total={prettyPrintStat(countryInfo.deaths)}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
          ></InfoBox>
        </div>
        <Map
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
          countries={mapCountries}
        />
      </div>

      {/* Header */}
      {/* Title+Select Input Dropdown */}
      {/* InfoBoxees
     InfoBoxes 
     Infoboxes
     Table
     Graph
     Map */}
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3>WorldWide New {casesType} </h3>
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
