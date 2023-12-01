class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.message = message;
  }

  toObj() {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

module.exports = NotFound;
