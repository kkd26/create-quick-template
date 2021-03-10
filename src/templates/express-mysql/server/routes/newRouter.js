const DB = require('../middleware/db');

const getRouter = (tableName) => {
  const router = require('express').Router();

  router.get('/', async function (req, res, next) {
    DB.selectAll(tableName, function (err, rows) {
      if (err) {
        res.status(500).send();
      } else {
        res.json(rows);
      }
    });
  });

  router.get('/:id', async function (req, res, next) {
    const id = req.params.id;

    DB.selectOne(tableName, { id }, function (err, rows) {
      if (err) {
        res.status(404).send({ message: 'incorrect id' });
      } else {
        res.json(rows);
      }
    });
  });

  router.post('/', async function (req, res, next) {
    const data = req.body;
    DB.createOne(tableName, data, function (err) {
      if (err) {
        console.error(err);
        res.status(400).json({ message: 'Failure to create an object' });
      } else {
        res.status(201).send({ message: 'Object has been created' });
      }
    });
  });

  router.delete('/:id', async function (req, res, next) {
    const id = req.params.id;
    DB.deleteOne(tableName, { id }, function (err) {
      if (err) {
        res.status(404).json({ message: 'incorrect id' });
      } else {
        res.json({ message: 'Object has been deleted' });
      }
    });
  });

  return router;
};

module.exports = getRouter;
