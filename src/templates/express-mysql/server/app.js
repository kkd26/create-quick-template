const express = require('express');
const logger = require('morgan');

const app = express();

const api = require('./routes/api');

const port = 3000;

app.use(logger('dev'));
app.use(express.json());
app.use('/api', api);
app.use('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
