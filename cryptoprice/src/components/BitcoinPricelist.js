import React, { Component } from 'react';
import * as SignalR from '@aspnet/signalr';
import moment from 'moment';
import 'fontsource-roboto';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

export class BitcoinPricelist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prices: [],
      hubConnection: null,
    }
  }

  componentDidMount = async () => {
    const prices = await this.LoadInitialValues();
    prices.forEach(recievedPrice => {
      const price = `${parseFloat(recievedPrice.value).toFixed(2)}`;
      const date = moment(recievedPrice.date).format('LT');
      const prices = this.state.prices;
      prices.push([price, date]);
      this.setState({ prices: prices });
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

      this.state.hubConnection.on('ReceivePrice', (recievedPrice) => {
        const price = `${parseFloat(recievedPrice.value).toFixed(2)}`;
        const date = moment(recievedPrice.date).format('LT');
        const prices = this.state.prices;
        if (prices.length === 5) {
          prices.shift();
        }
        prices.push([price, date]);
        this.setState({ prices: prices });
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

    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        {this.state.prices.slice().reverse().map((price, index) => (
          <Grid item key={index}>
            <Card className={classes.root}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                  1 Bitcoin equals
                </Typography>
                <Typography variant="h5" component="h2">
                  {`${price[0]}`}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  New Zealand Dollars
                </Typography>
                <Typography variant="body2" component="p">
                  at {price[1]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }
}