const multiparty = require('multiparty');

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const body = [];

    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        resolve(Buffer.concat(body).toString());
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

module.exports = {
  parseBody,
  parseMultipart
};
