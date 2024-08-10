const express = require('express');
const axios = require('axios');
const Repo = require('../models/Repo');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/fetch-stars', auth, async (req, res) => {
  try {
    const { repo1, repo2 } = req.body;
    const repoData = [];

    for (const repoUrl of [repo1, repo2]) {
      const [owner, repo] = repoUrl.split('/').slice(-2);
      let repoInfo = await Repo.findOne({ owner, repo });

      if (!repoInfo) {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
        });

        if (response.data.private) {
          return res.status(400).json({ message: `Repository ${owner}/${repo} is not public` });
        }

        const starsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/stargazers`, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
        });

        const starHistory = starsResponse.data.map(star => ({
          date: star.starred_at,
          count: starsResponse.data.indexOf(star) + 1
        }));

        repoInfo = new Repo({ owner, repo, starHistory });
        await repoInfo.save();
      }

      repoData.push({ owner, repo, starHistory: repoInfo.starHistory });
    }

    res.json(repoData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repository data' });
  }
});

module.exports = router;
