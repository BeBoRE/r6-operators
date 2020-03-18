const express = require('express');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const port = 4444;

const operatorDataRaw = fs.readFileSync('./public/data/operators.json').toString();
const operatorData = JSON.parse(operatorDataRaw);

app.use(helmet());
app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  let data;
  if (process.env.NODE_ENV === 'development') data = JSON.parse(fs.readFileSync('./public/data/operators.json').toString());
  else data = operatorData;
  res.render('index', { data: JSON.stringify(data), text: 'hallo' });
});

app.listen(port).on('listening', () => console.log(`Now listening on port ${port} in a ${process.env.NODE_ENV} environment`));
