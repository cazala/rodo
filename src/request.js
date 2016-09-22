module.exports = request;

function request() {
  const builder = {};
  let response;

  builder.reply = (body) => {
    response = body;
  };

  return {
    builder,
    run,
  };

  function run(req, res) {
    res.send(response);
  }
}

