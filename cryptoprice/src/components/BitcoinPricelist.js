import React, { Component } from 'react';
import * as SignalR from '@aspnet/signalr';
import moment from 'moment';
import 'fontsource-roboto';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import CanvasJSReact from "../canvasjs.react";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export class BitcoinPricelist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prices: [],
      hubConnection: null,
      dataPoints: [], //data for rendering live chart of BTC&ETH prices
    }
  }

  componentDidMount = async () => {
    const prices = await this.LoadInitialValues();
    prices.forEach(receivedPrice => {
      const price = `${parseFloat(receivedPrice.value).toFixed(2)}`;
      const date = moment().format('LT');
      const currency = `${receivedPrice.currency}`;
      const prices = this.state.prices;
      const dataPoints = this.state.dataPoints;
      dataPoints.push({label: currency, y: parseFloat(price)});
      prices.push([price, date, currency]);
      this.setState({ prices: prices, dataPoints: dataPoints  });
    });

    this.InitialiseHub();
  }

  LoadInitialValues = async () => {
    const response = await fetch("https:///localhost:5001/Coinbase", {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
    });

    return await response.json();
  };

  InitialiseHub = () => {
    const hubConnection = new SignalR.HubConnectionBuilder().withUrl("https:///localhost:5001/btchub").build();

    this.setState({ hubConnection }, () => {
      this.state.hubConnection
        .start()
        .then(() => console.log('Connection started!'))
        .catch(err => console.log('Error while establishing connection :('));

        this.state.hubConnection.on('ReceivePrice', (receivedPrice) => {
          const price = `${parseFloat(receivedPrice.value).toFixed(2)}`;
          const date = moment().format('LT');
          const currency = `${receivedPrice.currency}`;
          const prices = this.state.prices;
          const dataPoints = this.state.dataPoints;
  
          if (prices.length === 2) {
            prices.shift();          
          }           
          
          dataPoints.push({label: currency, y: parseFloat(price)}); 
          if (dataPoints.length > 2) {
            dataPoints.splice(0,2);          
          }  
          
          prices.push([price, date, currency]);
          this.setState({ prices: prices, dataPoints: dataPoints });        
        })
    })
  }

  useStyles = () => makeStyles({
    root: {
      minWidth: 275
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });

  render() {
    const classes = this.useStyles();
    const options = { //Options used in rendering the live CanvasJS chart    
      title: {
        text: `Bitcoin & Ethereum Live Chart (in NZD)`
      },
      data: [
        {
          type: "column",
          dataPoints: this.state.dataPoints,
        }
      ]
    };

    return (
      <div>
        <Grid
          container
          spacing={1}
          direction="row"
          alignItems="center"
          justify="center"
          style={{ minHeight: '25vh' }}
        >
          {this.state.prices.slice().map((price, index) => (
            <Grid item key={index}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    1 {`${price[2]}`} equals
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {`${price[0]}`}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    in New Zealand Dollars
                  </Typography>
                  <Typography variant="body2" component="p">
                    at {price[1]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>        
        <CanvasJSChart
          options={options}
        />
      </div>
    )
  }
}