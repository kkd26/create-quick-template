var mysql = require('mysql');

const { DB_PASS, DB_LOGIN, DB_HOST, DB_NAME } = require('./db.config');

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_LOGIN,
  password: DB_PASS,
  database: DB_NAME,
});

db.connect((err) => {
  if (err) console.error('Mysql error', err);
});

class DB {
  static selectAll = (tableName, next) => {
    db.query(`select * from ${tableName}`, (err, rows, fields) => {
      if (err) next(err);
      else next(err, rows);
    });
  };

  static selectOne = (tableName, obj, next) => {
    const params = getWhereParams(obj);
    db.query(
      `select * from ${tableName} where ${params} limit 1`,
      (err, rows, fields) => {
        if (err || !rows[0]) next(new Error());
        else next(err, rows[0]);
      }
    );
  };

  static createOne = (tableName, obj, next) => {
    const params = getInsertParams(obj);
    db.query(`insert into ${tableName} ${params}`, (err, result) => {
      if (err || result.affectedRows !== 1) next(err || new Error());
      else next(err, result);
    });
  };

  static deleteOne = (tableName, obj, next) => {
    const params = getWhereParams(obj);
    db.query(`delete from ${tableName} where ${params}`, (err, result) => {
      if (err || result.affectedRows === 0) next(err || new Error());
      else next(err, result);
    });
  };
}

const getWhereParams = (obj) => {
  const result = [];
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      result.push(`${key}='${element}'`);
    }
  }

  return result.join(' and ');
};

const getInsertParams = (obj) => {
  const col = [];
  const val = [];
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      col.push(key);
      val.push(`'${element}'`);
    }
  }
  return `(${col.join(', ')}) values (${val.join(', ')})`;
};

module.exports = DB;
