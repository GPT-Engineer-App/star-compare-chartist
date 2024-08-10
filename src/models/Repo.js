const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  starHistory: [{ date: Date, count: Number }]
});

module.exports = mongoose.model('Repo', repoSchema);
